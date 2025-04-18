#!/usr/bin/python3
import os
import json
import mmap
import sys
import argparse
import math
import time
from hashlib import md5, sha1
from typing import Optional, Tuple, Iterable, Union, Generator, List
import multiprocessing # Added for parallelism
import logging # Added for better logging in workers

# --- Basic Configuration ---
try:
    import mmh3
    _murmur_available = True
except ImportError:
    _murmur_available = False
    mmh3 = None

DEFAULT_ALIGNMENT = 16384
WINDOWS_ALIGNMENT = 65536
DEFAULT_HASH_FUNC = 'md5'
FAST_HASH_FUNC = 'murmur3'
WORKER_CHUNK_SIZE = 100000 # How many lines each worker processes at a time (can tune this)

# Setup basic logging
# Use a more robust logger name if this is part of a larger project
log = logging.getLogger("bloom_tool_mp")
# Configure logging (only if not already configured by an importing script)
if not log.handlers:
     logging.basicConfig(level=logging.INFO,
                         format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


# --- Functions (calculate_optimal_params, get_alignment) ---
# (These functions remain unchanged)
def calculate_optimal_params(n: int, p: float) -> Tuple[int, int]:
    if not (0 < p < 1):
        raise ValueError("False positive probability 'p' must be between 0 and 1")
    if n <= 0:
        raise ValueError("Number of items 'n' must be positive")
    m_float = - (n * math.log(p)) / (math.log(2) ** 2)
    k_float = (m_float / n) * math.log(2)
    m = math.ceil(m_float)
    k = max(1, round(k_float))
    return m, k

def get_alignment() -> int:
    try:
        pagesize = os.sysconf("SC_PAGESIZE")
        return max(pagesize if pagesize > 0 else DEFAULT_ALIGNMENT, 4096)
    except (AttributeError, ValueError, OSError):
        return DEFAULT_ALIGNMENT
# --- BloomFilter Class ---
# (Largely unchanged from the previous multiprocessing version)
# Make sure it includes the robust opening/creation and logging from the previous version
class BloomFilter:
    def __init__(self,
                 filename: str,
                 m: Optional[int] = None,
                 k: Optional[int] = None,
                 readonly: bool = False,
                 hash_func_name: Optional[str] = None,
                 logger=None): # Added logger parameter
        self.filename = filename
        self.m: Optional[int] = m
        self.k: Optional[int] = k
        self.readonly = readonly
        self.hash_func_name = hash_func_name
        self.size: Optional[int] = None
        self.offset: Optional[int] = None
        self.alignment = get_alignment()
        # Use provided logger or get one specific to the class instance if needed
        self.logger = logger if logger else logging.getLogger(f"{__name__}.BloomFilter")

        self.fd: Optional[object] = None
        self.bits: Optional[mmap.mmap] = None

        # --- Robust Opening/Creation Logic ---
        file_exists = os.path.exists(filename)

        if file_exists:
            try:
                self._open()
            except Exception as e:
                self.logger.error(f"Failed to open existing filter '{filename}': {e}", exc_info=False) # Less verbose traceback often ok here
                self.close()
                raise # Re-raise the exception

            # Validate parameters if not in readonly mode and parameters were provided
            if not readonly:
                # Check m
                if m is not None and m != self.m:
                    msg = f"Provided m ({m}) does not match file's m ({self.m})"
                    self.logger.error(msg)
                    self.close()
                    raise ValueError(msg)
                # Check k
                if k is not None and k != self.k:
                    msg = f"Provided k ({k}) does not match file's k ({self.k})"
                    self.logger.error(msg)
                    self.close()
                    raise ValueError(msg)
                # Check hash function name consistency
                if hash_func_name is not None and self.hash_func_name is not None and hash_func_name != self.hash_func_name:
                    msg = f"Provided hash_func_name ('{hash_func_name}') does not match file's ('{self.hash_func_name}')"
                    self.logger.error(msg)
                    self.close()
                    raise ValueError(msg)

        elif readonly:
            # Trying to open non-existent file in read-only mode
            msg = f"File '{filename}' not found and opened in read-only mode."
            self.logger.error(msg)
            raise FileNotFoundError(msg)
        else:
            # File doesn't exist, create it (needs m and k)
            if m is None or k is None:
                msg = "Filter file does not exist, and 'm' and 'k' parameters are required for creation."
                self.logger.error(msg)
                raise ValueError(msg)
            if m <= 0 or k <= 0:
                msg = "m (bits) and k (hashes) must be positive integers for creation."
                self.logger.error(msg)
                raise ValueError(msg)

            # Determine hash function for creation
            if self.hash_func_name is None:
                self.hash_func_name = FAST_HASH_FUNC if _murmur_available else DEFAULT_HASH_FUNC
                self.logger.info(f"No hash function specified for creation, defaulting to '{self.hash_func_name}'.")

            if self.hash_func_name == FAST_HASH_FUNC and not _murmur_available:
                 self.logger.warning(f"Requested hash function '{FAST_HASH_FUNC}' but mmh3 library not found. "
                                     f"Falling back to '{DEFAULT_HASH_FUNC}'. Install 'mmh3' for better performance.")
                 self.hash_func_name = DEFAULT_HASH_FUNC

            try:
                self._create(m, k, self.hash_func_name)
                # Log after successful creation and mapping
                self.logger.info(f"Created new filter file: {self}")
            except Exception as e:
                self.logger.error(f"Failed to create filter file '{filename}': {e}", exc_info=True)
                self.close() # Ensure cleanup if creation fails
                raise # Re-raise the exception

    def _open(self) -> None:
        mode = "rb" if self.readonly else "r+b"
        access_mode = mmap.ACCESS_READ if self.readonly else mmap.ACCESS_WRITE
        try:
            self.fd = open(self.filename, mode)
            # Read header carefully
            hdr_line_bytes = self.fd.readline()
            if not hdr_line_bytes or hdr_line_bytes.strip() == b'':
                 raise IOError("File appears empty or header is missing/empty.")

            hdr_line = hdr_line_bytes.decode("ascii").strip()
            if not hdr_line:
                 raise IOError("Decoded header line is empty.")

            try:
                 hdr = json.loads(hdr_line)
            except json.JSONDecodeError as jde:
                 raise IOError(f"Failed to decode JSON header: {jde}. Header content: '{hdr_line_bytes!r}'") from jde


            # Extract and validate header values
            self.m = int(hdr["m"])
            self.k = int(hdr["k"])
            self.size = int(hdr["size"]) # mmap data region size
            self.offset = int(hdr["offset"]) # Start of mmap data region
            # Handle potentially missing hash_func_name gracefully
            self.hash_func_name = hdr.get("hash_func_name", DEFAULT_HASH_FUNC if not _murmur_available else FAST_HASH_FUNC)
            self.alignment = self.offset # Alignment used during creation is stored in offset

            if self.hash_func_name == FAST_HASH_FUNC and not _murmur_available:
                 self.logger.warning(f"Filter file uses '{FAST_HASH_FUNC}', but mmh3 library not installed. "
                                     "Hashing operations will likely fail if attempted.")

            if self.m <= 0 or self.k <= 0 or self.size <= 0 or self.offset <= 0:
                 raise IOError(f"Invalid parameters (<= 0) found in filter header: m={self.m}, k={self.k}, size={self.size}, offset={self.offset}")

            # Verify file size consistency
            file_size = os.fstat(self.fd.fileno()).st_size
            expected_min_size = self.offset + self.size # Header offset + data size
            # Allow for slightly larger files, but not smaller
            if file_size < expected_min_size:
                 raise IOError(f"File size ({file_size} B) is smaller than expected based on header "
                               f"({expected_min_size} B = offset {self.offset} + data {self.size}). File may be truncated or corrupt.")

            # Create the memory map
            # Ensure size and offset are valid for mmap
            if self.size <= 0:
                 raise IOError(f"Invalid calculated size for mmap: {self.size}")
            if self.offset < 0:
                 raise IOError(f"Invalid calculated offset for mmap: {self.offset}")

            # On some systems, mmap length must be > 0 even if offset is used
            mmap_length = file_size - self.offset if self.readonly else self.size
            if mmap_length <=0:
                 raise IOError(f"Calculated mmap length is not positive ({mmap_length}) based on file size {file_size} and offset {self.offset}")


            self.bits = mmap.mmap(self.fd.fileno(), self.size, offset=self.offset, access=access_mode)
            self.logger.debug(f"Successfully opened and mapped filter: {self}")

        except (IOError, OSError, json.JSONDecodeError, KeyError, ValueError, TypeError) as e:
            self.close()
            raise IOError(f"Failed to open or parse Bloom filter file '{self.filename}': {e}") from e
        except Exception as e:
            self.close()
            raise e


    def _create(self, m: int, k: int, hash_func_name: str) -> None:
        if m <= 0 or k <= 0:
            raise ValueError("m and k must be positive for filter creation.")

        byte_size = (m + 7) // 8 # Calculate raw byte size needed for m bits
        self.m = m
        self.k = k
        self.hash_func_name = hash_func_name
        self.offset = self.alignment # Offset starts after alignment bytes for header/padding
        # Calculate data region size, ensuring it's a multiple of alignment
        self.size = (byte_size + self.alignment - 1) // self.alignment * self.alignment

        if self.size <= 0:
             raise ValueError(f"Calculated data region size is not positive ({self.size}). Check m ({m}) and alignment ({self.alignment}).")


        hdr = {
            "m": self.m,
            "k": self.k,
            "offset": self.offset,
            "size": self.size, # Store the aligned data size
            "hash_func_name": self.hash_func_name,
        }
        hdr_bytes = (json.dumps(hdr) + "\n").encode("ascii")
        hdr_len = len(hdr_bytes)

        if hdr_len > self.offset:
             raise RuntimeError(f"Header length ({hdr_len} bytes) exceeds calculated offset/alignment ({self.offset} bytes). Increase alignment.")

        try:
            self.fd = open(self.filename, "w+b")

            # Write header and padding
            self.fd.write(hdr_bytes)
            if self.fd.tell() < self.offset:
                self.fd.seek(self.offset - 1)
                self.fd.write(b'\0')

            # Extend file to full size (data region end)
            self.fd.seek(self.offset + self.size - 1)
            self.fd.write(b"\x00")
            self.fd.flush() # Ensure OS writes metadata/size changes

            # Now map the data region
            self.bits = mmap.mmap(self.fd.fileno(), self.size, offset=self.offset, access=mmap.ACCESS_WRITE)
            # Do NOT initialize here - very slow for large files. Assume OS provides zeroed pages or it's handled correctly.

        except (IOError, OSError) as e:
            self.close()
            raise IOError(f"Failed to create Bloom filter file structure '{self.filename}': {e}") from e
        except Exception as e:
            self.close()
            raise e

    # --- _get_hashes Method ---
    # (Unchanged)
    def _get_hashes(self, item_bytes: bytes) -> Generator[int, None, None]:
        if self.m is None or self.k is None:
             raise RuntimeError("Filter parameters m and k are not set.")
        if self.m <= 0:
             raise RuntimeError(f"Filter parameter m must be positive (is {self.m}).")

        if self.hash_func_name == FAST_HASH_FUNC:
            if mmh3 is None:
                 raise RuntimeError("mmh3 library required for murmur3 hashing but not found.")
            if not isinstance(item_bytes, bytes):
                raise TypeError(f"Input must be bytes for hashing, got {type(item_bytes)}")

            hash1 = mmh3.hash(item_bytes, seed=0, signed=False)
            hash2 = mmh3.hash(item_bytes, seed=hash1, signed=False)

            for i in range(self.k):
                index = (hash1 + i * hash2)
                yield index % self.m

        else: # MD5 fallback
            if not isinstance(item_bytes, bytes):
                raise TypeError(f"Input must be bytes for hashing, got {type(item_bytes)}")
            current_hash = md5(item_bytes).digest()
            for i in range(self.k):
                 hash_int = int.from_bytes(current_hash[8:], byteorder='little', signed=False)
                 yield hash_int % self.m
                 current_hash = md5(current_hash).digest()

    # --- add, update, contains Methods ---
    # (Largely unchanged, ensure logging and error handling are robust)
    def add(self, item: Union[str, bytes]) -> None:
        if self.readonly:
            raise PermissionError("Cannot add items to a read-only filter.")
        if self.bits is None or getattr(self.bits, 'closed', True): # Check if mmap is closed
             raise RuntimeError("Filter is not open or mapped for adding.")

        item_bytes = item.encode('utf-8') if isinstance(item, str) else item
        if not isinstance(item_bytes, bytes):
             self.logger.error(f"Item could not be converted to bytes: {item!r}")
             return

        for h in self._get_hashes(item_bytes):
            byte_idx, bit_offset = divmod(h, 8)
            try:
                if 0 <= byte_idx < self.size:
                     self.bits[byte_idx] |= (1 << bit_offset)
                else:
                    self.logger.warning(f"Index {h} (byte {byte_idx}) out of bounds (size {self.size}). Ignoring.")
            except IndexError:
                 self.logger.error(f"IndexError: Index {h} (byte {byte_idx}) out of bounds for mapped size {len(self.bits)}.", exc_info=False)
            except (ValueError, TypeError) as e:
                 self.logger.error(f"mmap error during add: {e}", exc_info=False)
                 raise RuntimeError("Bloom filter mmap appears closed or invalid during add.") from e

    def update(self, items: Iterable[Union[str, bytes]]) -> None:
        if self.readonly:
            raise PermissionError("Cannot add items to a read-only filter.")
        if self.bits is None or getattr(self.bits, 'closed', True):
             raise RuntimeError("Filter is not open or mapped for update.")

        indices_to_set = set() # Collect indices first for potentially faster update
        processed_count = 0
        for item in items:
            item_bytes = item.encode('utf-8') if isinstance(item, str) else item
            if not isinstance(item_bytes, bytes):
                 self.logger.warning(f"Skipping item that could not be converted to bytes: {item!r}")
                 continue
            try:
                for h in self._get_hashes(item_bytes):
                     indices_to_set.add(h)
                processed_count += 1
            except Exception as e:
                 self.logger.error(f"Error hashing item {item!r}: {e}", exc_info=False)

        # Now set the bits
        bits_flipped = 0
        for h in indices_to_set:
            byte_idx, bit_offset = divmod(h, 8)
            try:
                if 0 <= byte_idx < self.size:
                    mask = (1 << bit_offset)
                    current_byte_val = self.bits[byte_idx]
                    if not (current_byte_val & mask): # Check if bit needs flipping
                        self.bits[byte_idx] = current_byte_val | mask
                        bits_flipped += 1
                else:
                     self.logger.warning(f"Index {h} (byte {byte_idx}) out of bounds during update (size {self.size}). Ignoring.")
            except IndexError:
                 self.logger.error(f"IndexError during update: Index {h} (byte {byte_idx}) out of bounds.", exc_info=False)
            except (ValueError, TypeError) as e:
                 self.logger.error(f"mmap error during update: {e}", exc_info=False)
                 raise RuntimeError("Bloom filter mmap appears closed or invalid during update.") from e
        # self.logger.debug(f"Processed {processed_count} items in update, flipped {bits_flipped} bits.")


    def contains(self, item: Union[str, bytes]) -> bool:
        if self.bits is None or getattr(self.bits, 'closed', True):
             raise RuntimeError("Filter is not open or mapped for contains check.")

        item_bytes = item.encode('utf-8') if isinstance(item, str) else item
        if not isinstance(item_bytes, bytes):
             self.logger.error(f"Item could not be converted to bytes for check: {item!r}")
             return False

        try:
            for h in self._get_hashes(item_bytes):
                byte_idx, bit_offset = divmod(h, 8)
                if not (0 <= byte_idx < self.size):
                     self.logger.warning(f"Index {h} (byte {byte_idx}) out of bounds during check (size {self.size}). Assuming not present.")
                     return False
                if not (self.bits[byte_idx] & (1 << bit_offset)):
                    return False
        except IndexError:
             self.logger.error(f"IndexError during contains check: Index {h} (byte {byte_idx}).", exc_info=False)
             return False
        except (ValueError, TypeError) as e:
             self.logger.error(f"mmap error during contains check: {e}", exc_info=False)
             raise RuntimeError("Bloom filter mmap appears closed or invalid during contains check.") from e
        except Exception as e:
             self.logger.error(f"Error hashing item during contains check {item!r}: {e}", exc_info=False)
             return False

        return True

    def __contains__(self, item: Union[str, bytes]) -> bool:
        return self.contains(item)

    # --- sync, close, __enter__, __exit__, __del__, __repr__ Methods ---
    # (Unchanged from previous MP version)
    def sync(self) -> None:
        if self.readonly: return
        if self.bits and not getattr(self.bits, 'closed', True):
            try: self.bits.flush()
            except (ValueError, BufferError) as e: self.logger.warning(f"mmap flush failed: {e}")
        if self.fd and not self.fd.closed:
            try:
                self.fd.flush()
                os.fsync(self.fd.fileno())
            except (IOError, OSError, ValueError) as e: self.logger.warning(f"File sync/flush failed: {e}")

    def close(self) -> None:
        if self.bits and not getattr(self.bits, 'closed', True):
            try: self.bits.close()
            except Exception as e: self.logger.warning(f"Error closing mmap: {e}")
        self.bits = None
        if self.fd and not self.fd.closed:
            try: self.fd.close()
            except Exception as e: self.logger.warning(f"Error closing file descriptor: {e}")
        self.fd = None

    def __enter__(self): return self
    def __exit__(self, exc_type, exc_value, traceback): self.close()
    def __del__(self): self.close()

    def __repr__(self) -> str:
        status = "read-only" if self.readonly else "writable"
        mapped_status = "mapped" if self.bits and not getattr(self.bits, 'closed', True) else "closed"
        params = ""
        if self.m is not None and self.k is not None:
             params = f" m={self.m:,} k={self.k} hash='{self.hash_func_name or 'N/A'}'"
        return (f"<BloomFilter file='{os.path.basename(self.filename)}'{params} "
                f"status='{status}/{mapped_status}'>")

# --- Argument Parser Setup ---
# (Unchanged from previous MP version - includes -w workers arg)
def setup_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create, load, test, or inspect file-backed Bloom filters using multiprocessing.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Parameter Estimation Help:
  Use 'calculate_optimal_params(n, p)' function or online calculators.
  Example: HIBP v8 (n ≈ 850,000,000), Desired p = 0.0001 (1 in 10k):
    Optimal m ≈ 16.3 Gbits (~16,300,000,000), k ≈ 14

Example Usage:
  # Create filter using 4 worker processes (RECOMMENDED for 8GB RAM):
  {sys.argv[0]} load -m 16300000000 -k 11 --sha1 --hash-func murmur3 -w 4 \\
    hibp_v8_murmur.bloom pwned-v8.txt

  # Create filter using default number of workers (adjust if needed):
  {sys.argv[0]} load -m 16300000000 -k 11 --sha1 \\
    hibp_v8_murmur.bloom pwned-v8.txt

  # Test or Info commands remain the same:
  {sys.argv[0]} test --sha1 hibp_v8_murmur.bloom MyPassword123
  {sys.argv[0]} info -n 850000000 hibp_v8_murmur.bloom
"""
    )

    subparsers = parser.add_subparsers(dest="subcommand", required=True, help='Sub-command to execute')

    # --- Load Sub-parser ---
    p_load = subparsers.add_parser('load', help='Create or add items to a Bloom filter file using parallelism.')
    p_load.add_argument("-m", "--bits", type=int, help="Number of bits (m) for filter creation (required if file doesn't exist).")
    p_load.add_argument("-k", "--hashes", type=int, help="Number of hash functions (k) for filter creation (required if file doesn't exist).")
    p_load.add_argument("--hash-func", choices=[DEFAULT_HASH_FUNC, FAST_HASH_FUNC], default=None, help=f"Hash function for CREATION. Defaults to '{FAST_HASH_FUNC}' if mmh3 installed, else '{DEFAULT_HASH_FUNC}'. Ignored if filter exists.")
    p_load.add_argument("-l", "--lower", action="store_true", help="Lowercase input items before adding (for non-hash data).")
    p_load.add_argument("-s", "--sha1", action="store_true", help="Input items are SHA1 hashes (takes first 40 chars, uppercases). Use for HIBP files.")
    # Default workers to a safer number, like 4, for memory constraints
    default_workers = max(1, min(4, os.cpu_count() or 1))
    p_load.add_argument("-w", "--workers", type=int, default=default_workers, help=f"Number of worker processes (default: {default_workers}, recommended <= 4 for 8GB RAM).")
    p_load.add_argument("filter", type=str, help='Filename of the filter file to create or update.')
    p_load.add_argument("input", type=str, help='Input file containing items to add (one per line).')
    p_load.set_defaults(func=cmd_load)

    # --- Test Sub-parser ---
    p_test = subparsers.add_parser('test', help='Check if a value is potentially in the filter.')
    p_test.add_argument("-l", "--lower", action="store_true", help="Lowercase the test value before checking.")
    p_test.add_argument("-s", "--sha1", action="store_true", help="SHA-1 hash the test value before checking (use for password tests).")
    p_test.add_argument("filter", type=str, help='Filename of the filter file to test against.')
    p_test.add_argument("value", type=str, help='Value to test for membership.')
    p_test.set_defaults(func=cmd_test)

    # --- Info Sub-parser ---
    p_info = subparsers.add_parser('info', help='Display parameters and info about an existing filter.')
    p_info.add_argument("-n", "--n", type=int, default=None, help="Estimated number of items (n) inserted, used for calculating theoretical false positive rate.")
    p_info.add_argument("filter", type=str, help='Filename of the filter file to inspect.')
    p_info.set_defaults(func=cmd_info)

    return parser

# --- NEW: Input Chunk Reader ---
def read_chunks(filename: str, chunk_size: int) -> Generator[List[str], None, None]:
    """Reads the input file line by line and yields chunks of lines."""
    chunk = []
    try:
        with open(filename, "r", encoding="utf-8", errors="ignore") as infile:
            for line in infile:
                chunk.append(line)
                if len(chunk) >= chunk_size:
                    yield chunk
                    chunk = []
        # Yield any remaining lines in the last chunk
        if chunk:
            yield chunk
    except FileNotFoundError:
        log.error(f"Input file '{filename}' not found during chunk reading.")
        raise # Re-raise to be caught by the main command
    except Exception as e:
        log.error(f"Error reading input file '{filename}': {e}", exc_info=True)
        raise


# --- Worker Process Function (Modified Args) ---
def worker_process(args_tuple):
    """Processes a chunk of lines and updates the shared Bloom filter."""
    # Unpack arguments more simply
    filter_filename, m, k, hash_func_name, apply_sha1, apply_lower, lines_chunk = args_tuple
    processed_in_worker = 0
    worker_log = logging.getLogger(f"Worker-{os.getpid()}") # Simple worker logger name

    try:
        # Each worker opens the *same* filter file. mmap handles the sharing.
        # worker_log.debug(f"Processing {len(lines_chunk)} lines for {filter_filename}")

        # Use readonly=False, params m,k,hash_func are just for opening/validation consistency
        # The file MUST exist and be initialized by the main process before workers start
        with BloomFilter(filter_filename, m=m, k=k, hash_func_name=hash_func_name, readonly=False, logger=worker_log) as filt:
            items_to_update = []
            for line in lines_chunk: # Iterate directly over the passed chunk
                item = line.strip()
                if not item:
                    continue

                # Apply transformations (SHA1 or lower)
                if apply_sha1:
                    if len(item) >= 40:
                        item = item[:40].upper()
                    else:
                        # Skip short lines silently in worker, main process can report total read vs processed
                        continue
                elif apply_lower:
                    item = item.lower()

                items_to_update.append(item)
                # No need to track processed_in_worker inside loop if only returning total

            # Update the filter with the collected items for this chunk
            if items_to_update:
                filt.update(items_to_update)
                # NO sync() here - let main process handle final sync

        # worker_log.debug(f"Worker finished chunk.")
        # Return the number of *valid* lines processed from this chunk
        return len(items_to_update)

    except Exception as e:
        # Log exceptions occurring within the worker process
        worker_log.error(f"Error in worker process: {e}", exc_info=True)
        return 0 # Return 0 processed lines on error


# --- Command Functions (cmd_load Modified) ---
def cmd_load(args: argparse.Namespace) -> None:
    """Handles the 'load' command using multiprocessing with imap_unordered."""
    start_time = time.monotonic()
    total_processed_count = 0
    total_lines_read = 0 # Track lines read separately
    input_filename = args.input
    filter_filename = args.filter
    num_workers = args.workers

    if num_workers <= 0:
        log.warning(f"Invalid number of workers ({num_workers}), defaulting to 1.")
        num_workers = 1

    log.info(f"Starting parallel load operation (using imap_unordered):")
    log.info(f"  Input File:  '{input_filename}'")
    log.info(f"  Filter File: '{filter_filename}'")
    log.info(f"  Workers:     {num_workers}")
    log.info(f"  Params (for creation): m={args.bits}, k={args.hashes}, hash={args.hash_func or 'auto'}")
    log.info(f"  SHA1 Input:  {args.sha1}")
    log.info(f"  Lowercase:   {args.lower}")
    log.info(f"  Chunk Size:  {WORKER_CHUNK_SIZE:,}")

    # 1. Create or Open the filter file initially in the main process (Essential!)
    actual_m, actual_k, actual_hash_func = None, None, None
    try:
        log.info("Initializing filter file...")
        # Create/Open and then immediately close to ensure it exists and header is valid
        with BloomFilter(filter_filename, m=args.bits, k=args.hashes, hash_func_name=args.hash_func) as initial_filt:
            log.info(f"Filter parameters: {initial_filt}")
            actual_m = initial_filt.m
            actual_k = initial_filt.k
            actual_hash_func = initial_filt.hash_func_name
            if not actual_m or not actual_k or not actual_hash_func:
                 raise RuntimeError("Failed to get valid filter parameters after opening/creating.")
        log.info("Filter file initialized successfully.")
    except (IOError, OSError, ValueError, PermissionError, RuntimeError, FileNotFoundError) as e:
        log.error(f"Error initializing filter file: {e}", exc_info=True)
        sys.exit(1)
    except Exception as e:
        log.error(f"Unexpected error during filter initialization: {e}", exc_info=True)
        sys.exit(1)

    # 2. Setup multiprocessing Pool and process using imap_unordered
    log.info(f"Loading data from '{input_filename}' using {num_workers} workers...")
    start_processing_time = time.monotonic()
    last_print_time = start_processing_time
    chunks_submitted = 0

    # Prepare the arguments that are the same for all worker calls
    worker_base_args = (filter_filename, actual_m, actual_k, actual_hash_func,
                        args.sha1, args.lower)

    # Create an iterable of arguments for imap_unordered
    # Each item yielded by read_chunks is appended to the base args tuple
    imap_args = (worker_base_args + (chunk,) for chunk in read_chunks(input_filename, WORKER_CHUNK_SIZE))

    try:
        with multiprocessing.Pool(processes=num_workers) as pool:
            # Use imap_unordered for lazy processing and better memory management
            # results is an iterator that yields results as they complete (out of order)
            results = pool.imap_unordered(worker_process, imap_args)

            for lines_in_chunk_processed in results:
                chunks_submitted += 1 # Track submitted chunks implicitly by getting results
                total_processed_count += lines_in_chunk_processed # Add count returned by worker

                # Progress Reporting ( throttled )
                current_time = time.monotonic()
                if current_time - last_print_time > 2.0: # Update every 2 seconds
                    elapsed = current_time - start_processing_time
                    rate = total_processed_count / elapsed if elapsed > 0 else 0
                    # Estimate total lines read based on chunks processed so far
                    est_lines_read = chunks_submitted * WORKER_CHUNK_SIZE
                    print(f"\rProcessed: {total_processed_count:,} lines ({rate:,.0f} lines/s, Chunks done: {chunks_submitted:,})...", end="", flush=True)
                    last_print_time = current_time

            # End of processing loop

    except FileNotFoundError: # Catch error from read_chunks if file disappears
        log.error(f"Input file '{input_filename}' not found during processing.")
        # Pool context manager handles cleanup
        sys.exit(1)
    except Exception as e:
         log.error(f"An error occurred during multiprocessing: {e}", exc_info=True)
         # Pool context manager handles cleanup
         sys.exit(1)

    # Final Stats after loop finishes
    final_elapsed = time.monotonic() - start_processing_time
    final_rate = total_processed_count / final_elapsed if final_elapsed > 0 else 0
    # Clear the progress line and print final stats
    print("\r" + " " * 80 + "\r", end="") # Clear line
    log.info(f"Processing complete. Processed {total_processed_count:,} total valid lines.")
    log.info(f"Average processing rate: {final_rate:,.0f} lines/s.")

    # 3. Final Sync (Optional but recommended)
    try:
        log.info("Performing final sync of filter data to disk...")
        with BloomFilter(filter_filename, readonly=False) as final_filt:
             final_filt.sync()
        log.info("Sync complete.")
    except Exception as e:
        log.error(f"Error during final sync: {e}", exc_info=True)


    total_time = time.monotonic() - start_time
    log.info(f"Total operation time: {total_time:.2f} seconds.")


# --- cmd_test and cmd_info ---
# (Unchanged from the previous fixed MP version - they don't use Pool)
def cmd_test(args: argparse.Namespace) -> None:
    filter_filename = args.filter
    value_to_test_orig = args.value
    log.info(f"Testing value '{value_to_test_orig}' against filter '{filter_filename}'")
    try:
        with BloomFilter(filter_filename, readonly=True) as filt:
            log.info(f"Filter opened: {filt}")
            value_to_test_proc = value_to_test_orig
            if args.sha1:
                if not isinstance(value_to_test_proc, str): value_to_test_proc = str(value_to_test_proc)
                hashed_value = sha1(value_to_test_proc.encode('utf-8')).hexdigest().upper()
                log.info(f"  Input will be checked as SHA1 hash: '{hashed_value}'")
                value_to_test_proc = hashed_value
            elif args.lower:
                 if isinstance(value_to_test_proc, str):
                      processed_value = value_to_test_proc.lower()
                      if processed_value != value_to_test_proc: log.info(f"  Input lowercased: '{processed_value}'")
                      value_to_test_proc = processed_value
                 else: log.warning("Cannot lowercase non-string input.")
            start_time = time.monotonic()
            found = value_to_test_proc in filt
            end_time = time.monotonic()
            query_time_ms = (end_time - start_time) * 1000
            if found: log.info(f"Result: Found (POSSIBLY in set)")
            else: log.info(f"Result: Not found (DEFINITELY NOT in set)")
            log.info(f"Query time: {query_time_ms:.4f} ms")
    except FileNotFoundError: log.error(f"Filter file '{filter_filename}' not found."); sys.exit(1)
    except (IOError, OSError, ValueError) as e: log.error(f"Error opening/reading filter '{filter_filename}': {e}", exc_info=True); sys.exit(1)
    except RuntimeError as e: log.error(f"Runtime error during test: {e}", exc_info=True); sys.exit(1)
    except Exception as e: log.error(f"Unexpected error during test: {e}", exc_info=True); sys.exit(1)

def cmd_info(args: argparse.Namespace) -> None:
    filter_filename = args.filter
    estimated_n = args.n
    log.info(f"Inspecting Bloom filter file: {filter_filename}")
    try:
        with BloomFilter(filter_filename, readonly=True) as filt:
            print("-" * 20); print(f"Filter Parameters:"); print(f"  File: {os.path.basename(filter_filename)}")
            print(f"  Bits (m): {filt.m:,}"); print(f"  Hashes (k): {filt.k}"); print(f"  Hash Func: {filt.hash_func_name}")
            print(f"  Data Offset: {filt.offset:,}"); print(f"  Data Size (mmap): {filt.size:,} bytes ({filt.size / (1024**2):.2f} MB)")
            print(f"  Alignment: {filt.alignment}"); print("-" * 20)
            if estimated_n is not None:
                print(f"Estimates for n = {estimated_n:,}:")
                if estimated_n <= 0: print("  Cannot estimate FP rate: n must be positive.")
                elif filt.m is None or filt.k is None or filt.m <=0 or filt.k <=0 : print("  Cannot estimate FP rate: Invalid m/k.")
                else:
                    try:
                        exponent = -filt.k * estimated_n / filt.m
                        p_actual = 0.0 if exponent < -700 else math.pow(1.0 - math.exp(exponent), filt.k)
                        print(f"  Theoretical FP Rate (p):")
                        if p_actual == 0.0: print("    ~ 0.0 (near zero)")
                        elif p_actual < 1e-9: print(f"    ~ {p_actual:.2e} (approx. 1 in {1/p_actual:,.0f})")
                        else: print(f"    ~ {p_actual:.8f} (approx. 1 in {1/p_actual:,.0f})")
                        optimal_k_float = (float(filt.m) / float(estimated_n)) * math.log(2)
                        print(f"  Optimal k for these m/n: ~{optimal_k_float:.2f} (current k={filt.k})")
                    except (OverflowError, ValueError) as e: print(f"  Could not calculate estimates (math error): {e}")
            else: print("  Provide '-n <item_count>' to estimate the false positive rate.")
            print("-" * 20)
    except FileNotFoundError: log.error(f"Filter file '{filter_filename}' not found."); sys.exit(1)
    except (IOError, OSError, ValueError) as e: log.error(f"Error opening/reading filter '{filter_filename}': {e}", exc_info=True); sys.exit(1)
    except Exception as e: log.error(f"Unexpected error during info: {e}", exc_info=True); sys.exit(1)

# --- Main Execution ---
if __name__ == "__main__":
    if sys.version_info < (3, 7):
        print("Error: This script requires Python 3.7 or higher.", file=sys.stderr)
        sys.exit(1)

    # Required for multiprocessing on some platforms, esp. when frozen
    multiprocessing.freeze_support()
    # Set start method to 'spawn' on macOS for potentially better stability with mmap? (Default is fork)
    # Might increase overhead slightly. Test if default 'fork' still causes issues.
    # try:
    #     if sys.platform == "darwin": # macOS
    #         multiprocessing.set_start_method('spawn', force=True)
    # except RuntimeError:
    #      log.warning("Could not set multiprocessing start method to 'spawn'. Using default.")
    #      pass


    arg_parser = setup_arg_parser()
    args = arg_parser.parse_args()

    # Configure logging level based on environment or default
    log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)
    # Reconfigure root logger if needed (might affect other libraries)
    # logging.basicConfig(level=log_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', force=True)
    # Or just set level for this tool's logger
    log.setLevel(log_level)
    # Add a handler if none exists (e.g., if run as main script)
    if not log.handlers:
         handler = logging.StreamHandler(sys.stderr)
         formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
         handler.setFormatter(formatter)
         log.addHandler(handler)


    if hasattr(args, 'func'):
        args.func(args)
    else:
        arg_parser.print_help()
        sys.exit(1)