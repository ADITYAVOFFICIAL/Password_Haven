# back/hashcat/models.py
from pydantic import BaseModel, Field
from typing import Optional

class CrackRequest(BaseModel):
    """
    Request model for initiating a hash cracking task via Hashcat.
    """
    hash_value: str = Field(
        ..., # Ellipsis means this field is required
        description="The hash string to be cracked.",
        examples=["098f6bcd4621d373cade4e832627b4f6"] # Example MD5 for 'test'
    )
    hash_mode: int = Field(
        ..., # Make mode required as default depends on context
        description="The hashcat mode number corresponding to the hash type (e.g., 0 for MD5, 1000 for NTLM).",
        examples=[0, 1000, 1800]
    )
    wordlist_filename: str = Field(
        ..., # Make wordlist required
        description="The filename of the wordlist (relative to the configured WORDLISTS_DIR) to use for the dictionary attack.",
        examples=["rockyou.txt", "custom_list.txt"]
    )
    # Optional: Add other hashcat parameters if needed, e.g., rules files
    # custom_args: Optional[list[str]] = None

class CrackResponse(BaseModel):
    """
    Response model for the hash cracking result from Hashcat.
    """
    status: str = Field(description="Status of the cracking attempt ('success', 'failed', 'error').")
    cracked_password: Optional[str] = Field(None, description="The cracked password, if found.")
    hash_value: str = Field(description="The original hash provided.")
    hash_mode: int = Field(description="The hashcat mode used.")
    wordlist_used: str = Field(description="The wordlist file used.")
    elapsed_time_seconds: Optional[float] = Field(None, description="Time taken for the hashcat process in seconds.")
    message: str = Field(description="Additional information or error details.")
    hashcat_output: Optional[str] = Field(None, description="Full stdout from the hashcat process (optional, potentially large).")