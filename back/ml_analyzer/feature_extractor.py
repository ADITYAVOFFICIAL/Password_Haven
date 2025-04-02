# back/ml_analyzer/feature_extractor.py
import pandas as pd
import numpy as np
import math
import logging
import decimal # Import decimal for type checking if needed
import datetime # Import datetime for type checking if needed
from typing import List, Dict, Any

# Ensure zxcvbn is installed: pip install zxcvbn-python
try:
    from zxcvbn import zxcvbn
except ImportError:
    print("ERROR: zxcvbn library not found. Please install it: pip install zxcvbn-python")
    # Depending on desired behavior, you might raise the error or exit
    raise

# Use the logger configured in router/main
logger = logging.getLogger("ml_analyzer.feature_extractor")

# --- Feature Extraction Logic (Aligned with Training Notebook) ---

def extract_features(password: str, feature_names: List[str]) -> pd.DataFrame:
    """
    Extracts features from a password using zxcvbn, precisely matching the
    logic and feature selection from the training notebook (LightGBM.ipynb).

    This function calculates only the features specified in `feature_names`,
    which should correspond to the 'feature_names.joblib' file saved during training.

    Args:
        password: The password string to analyze.
        feature_names: The exact list of feature names (and their order)
                       expected by the trained model (loaded from feature_names.joblib).
                       Based on the notebook, this should be:
                       ['password_length', 'guesses_log10', 'crack_time_log10',
                        'calc_time_ms', 'has_dictionary_match', 'has_repeat_match',
                        'count_lower', 'count_digit', 'count_symbol', 'is_empty']

    Returns:
        A pandas DataFrame with a single row containing the extracted features,
        ordered according to `feature_names` and typed as np.float32.

    Raises:
        ValueError: If feature extraction fails, a required feature cannot be
                    calculated, or the final DataFrame structure is invalid.
    """
    logger.debug(f"Starting feature extraction for password (length {len(password)}). Expecting features: {feature_names}")
    # Dictionary to hold calculated features before ordering
    calculated_features: Dict[str, Any] = {}

    # --- Consistent Handling of Empty Passwords (as per notebook) ---
    is_empty_flag = 1.0 if not password else 0.0
    # zxcvbn requires non-empty input, use a space if original is empty
    password_to_analyze = password if password else " "
    password_length = float(len(password)) # Calculate length of original password

    try:
        # --- Run ZXCVBN Analysis ---
        # logger.debug("Running zxcvbn analysis...")
        analysis_start_time = datetime.datetime.now()
        analysis = zxcvbn(password_to_analyze)
        analysis_duration = (datetime.datetime.now() - analysis_start_time).total_seconds()
        # logger.debug(f"zxcvbn analysis completed in {analysis_duration:.6f} seconds.")

        # --- Calculate ONLY the Features Used in Training (Based on feature_names) ---
        # These calculations directly mirror the logic within the notebook's
        # feature_engineer function *after* feature dropping.

        # 1. 'password_length'
        if 'password_length' in feature_names:
            calculated_features['password_length'] = password_length

        # 2. 'guesses_log10'
        if 'guesses_log10' in feature_names:
            guesses_log10_val = analysis.get('guesses_log10', 0.0)
            try:
                calculated_features['guesses_log10'] = float(guesses_log10_val)
            except (ValueError, TypeError, OverflowError):
                logger.warning(f"Could not convert guesses_log10 '{guesses_log10_val}' to float. Using 0.0.")
                calculated_features['guesses_log10'] = 0.0

        # 3. 'crack_time_log10'
        if 'crack_time_log10' in feature_names:
            # Use 'offline_fast_hashing_1e10_per_second' as per notebook example
            crack_time_seconds = analysis.get('crack_times_seconds', {}).get('offline_fast_hashing_1e10_per_second', 0.0)
            crack_time_float = 0.0
            try:
                crack_time_float = float(crack_time_seconds)
            except (ValueError, TypeError, OverflowError):
                 if crack_time_seconds != 0.0:
                     logger.warning(f"Could not convert crack_time_seconds '{crack_time_seconds}' to float. Using 0.0.")
            # Add small epsilon to prevent log10(0) or log10(negative) issues, matching notebook
            calculated_features['crack_time_log10'] = np.log10(max(crack_time_float, 1e-12) + 1e-9)

        # 4. 'calc_time_ms'
        if 'calc_time_ms' in feature_names:
            calc_time_value = analysis.get('calc_time', 0.0)
            calc_time_ms_float = 0.0
            # Handle different types returned by zxcvbn (float or timedelta) as in notebook
            if isinstance(calc_time_value, (int, float, decimal.Decimal)):
                try:
                    calc_time_ms_float = float(calc_time_value) * 1000.0
                except (ValueError, TypeError, OverflowError):
                    if calc_time_value != 0.0: logger.warning(f"Could not convert numeric calc_time '{calc_time_value}' to ms float.")
            elif hasattr(calc_time_value, 'total_seconds'): # Check for timedelta-like object
                 try:
                     calc_time_ms_float = float(calc_time_value.total_seconds()) * 1000.0
                 except Exception as e:
                     logger.warning(f"Could not convert timedelta-like calc_time '{calc_time_value}' to ms float: {e}")
            else:
                 if calc_time_value != 0.0: logger.warning(f"Unexpected type for calc_time '{type(calc_time_value)}' value '{calc_time_value}'. Using 0.0 ms.")
            calculated_features['calc_time_ms'] = calc_time_ms_float

        # 5. Match Features (based on 'sequence' list in zxcvbn results)
        current_sequence = analysis.get('sequence', [])
        if 'has_dictionary_match' in feature_names:
            calculated_features['has_dictionary_match'] = 1.0 if any(m.get('pattern') == 'dictionary' for m in current_sequence) else 0.0
        if 'has_repeat_match' in feature_names:
            calculated_features['has_repeat_match'] = 1.0 if any(m.get('pattern') == 'repeat' for m in current_sequence) else 0.0
        # NOTE: Other match features ('spatial', 'date', 'l33t', 'sequence') were DROPPED in the notebook and are NOT calculated here.

        # 6. Character Counts
        count_lower = float(sum(1 for char in password if char.islower()))
        count_upper = float(sum(1 for char in password if char.isupper())) # Need upper count to calculate symbol count
        count_digit = float(sum(1 for char in password if char.isdigit()))
        count_symbol = password_length - (count_lower + count_upper + count_digit)

        if 'count_lower' in feature_names:
            calculated_features['count_lower'] = count_lower
        if 'count_digit' in feature_names:
            calculated_features['count_digit'] = count_digit
        if 'count_symbol' in feature_names:
            calculated_features['count_symbol'] = count_symbol
        # NOTE: 'count_upper' was DROPPED in the notebook and is NOT included in calculated_features.

        # 7. 'is_empty' flag
        if 'is_empty' in feature_names:
            calculated_features['is_empty'] = is_empty_flag

        # --- Verification Step ---
        # Ensure all features requested in feature_names were actually calculated
        missing_features = [name for name in feature_names if name not in calculated_features]
        if missing_features:
            # This indicates a mismatch between this function's logic and the expected feature_names list
            logger.error(f"Internal logic error: Failed to calculate all expected features. Missing: {missing_features}")
            raise ValueError(f"Internal error: Missing expected features during calculation: {missing_features}")

        logger.debug(f"Successfully calculated {len(calculated_features)} raw features.")

    except OverflowError as ofe:
         # Handle specific zxcvbn errors if necessary, mirroring notebook
         logger.warning(f"OverflowError during zxcvbn analysis for password (len {len(password)}): {ofe}. Proceeding with potentially zeroed features.")
         # Create a dictionary with zeros for all expected features if zxcvbn fails catastrophically
         calculated_features = {name: 0.0 for name in feature_names}
         # Ensure 'is_empty' is set correctly even in this error case
         if 'is_empty' in calculated_features: calculated_features['is_empty'] = is_empty_flag
         if 'password_length' in calculated_features: calculated_features['password_length'] = password_length

    except Exception as e:
        logger.error(f"Unexpected error during zxcvbn analysis or feature calculation: {type(e).__name__}: {e}", exc_info=True)
        # Re-raise as ValueError to be handled by the API router
        raise ValueError(f"Feature extraction failed due to unexpected error: {e}") from e


    # --- Create DataFrame in the CORRECT order and type ---
    try:
        # Use the feature_names list passed as argument to select and order features.
        # Use .get() with a default of 0.0 for safety, although the check above should prevent missing keys.
        feature_data_ordered = {name: calculated_features.get(name, 0.0) for name in feature_names}

        # Create a single-row DataFrame
        features_df = pd.DataFrame([feature_data_ordered], columns=feature_names)

        # Final type conversion to float32, as used in the notebook before training/prediction
        features_df = features_df.astype(np.float32)

        logger.debug(f"Feature extraction successful. Final DataFrame shape: {features_df.shape}, Dtypes: {features_df.dtypes.unique()}")

    except Exception as e:
        logger.error(f"Error creating or typing the final feature DataFrame: {e}", exc_info=True)
        raise ValueError(f"Failed to create or type final feature DataFrame: {e}") from e

    return features_df

# --- Example Usage (for testing this file directly) ---
if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s [%(name)-25s] [%(levelname)-8s] %(message)s')
    logger = logging.getLogger("feature_extractor_test") # Use a distinct logger name for testing

    # CRITICAL: This list MUST match the columns saved in your 'feature_names.joblib'
    # Based on the notebook's 'feature_names_used' after dropping columns
    expected_feature_names_from_notebook = [
        'password_length',
        'guesses_log10',
        'crack_time_log10',
        'calc_time_ms',
        'has_dictionary_match',
        'has_repeat_match',
        'count_lower',
        'count_digit',
        'count_symbol',
        'is_empty'
    ]
    print(f"--- Expected Features ({len(expected_feature_names_from_notebook)}): {expected_feature_names_from_notebook} ---")

    test_passwords = ["password123", "Summer2024", "Tr0ub4dor&3", "P@$$w0rd!", "12345", "", "Complex!_12", "ÐÂÐÐ‹Ð†Ð‚Ð¡â"]
    for test_password in test_passwords:
        print("-" * 30)
        logger.info(f"Testing password: '{test_password}'")
        try:
            df = extract_features(test_password, expected_feature_names_from_notebook)
            print(f"\n--- Features for '{test_password}' ---")
            print(df.to_string(index=False)) # Print full DataFrame row without index
            print("DataFrame columns:", df.columns.tolist())
            print("DataFrame dtypes:", df.dtypes.tolist())

            # Verify order and names match exactly
            assert df.columns.tolist() == expected_feature_names_from_notebook, "Column names or order mismatch!"
            print("✅ Column names and order MATCH expected.")

            # Verify dtype is float32
            assert all(dtype == np.float32 for dtype in df.dtypes), "Not all dtypes are float32!"
            print("✅ All column dtypes MATCH expected (float32).")
            print("✅ Test PASSED")

        except (ValueError, AssertionError) as e:
            logger.error(f"❌ Test FAILED for '{test_password}': {e}", exc_info=True)
        except Exception as e:
             logger.error(f"❌ UNEXPECTED Error for '{test_password}': {type(e).__name__}: {e}", exc_info=True)