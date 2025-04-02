# back/ml_analyzer/router.py
import time
import logging
from fastapi import APIRouter, HTTPException, status, Depends
from pathlib import Path
import joblib
import pandas as pd
import numpy as np
import lightgbm as lgb
from typing import List, Dict, Any, Tuple, Union # <--- IMPORT List and others

# Use relative imports within the 'back' package
try:
    from .. import config
    from .models import PasswordInput, MLAnalysisResult
    from .feature_extractor import extract_features
except ImportError:
    # Fallback for running directly (less ideal)
    import sys
    sys.path.append(str(Path(__file__).resolve().parents[1])) # Add 'back' parent dir
    import config
    from ml_analyzer.models import PasswordInput, MLAnalysisResult
    from ml_analyzer.feature_extractor import extract_features
    print("Warning: Running ml_analyzer/router.py potentially outside of package context. Using fallback imports.")


# --- Logger Setup ---
logger = logging.getLogger("ml_analyzer.router")

# --- Router Definition ---
router = APIRouter()

# --- Global Variables for Loaded Model/Features (Load once on startup) ---
# Use Union for Python < 3.10 compatibility if needed, | is fine for >= 3.10
lgbm_model: Union[lgb.basic.Booster, lgb.LGBMClassifier, None] = None
feature_names: Union[List[str], None] = None # Use imported List
model_load_error: Union[str, None] = None

# --- Strength Mapping (Consistent Labels) ---
STRENGTH_LABELS = {
    0: "🚨 Very Weak",
    1: "🔥 Weak",
    2: "⚠️ Fair",
    3: "✅ Good",
    4: "🚀 Strong",
}
STRENGTH_EMOJIS = {
    0: "🚨", 1: "🔥", 2: "⚠️", 3: "✅", 4: "🚀"
}

# --- Model Loading Logic (Called during application startup) ---
def load_ml_model():
    """
    Loads the LightGBM model and feature names from disk using paths from config.
    Stores them in global variables or logs errors. Includes enhanced validation.
    """
    global lgbm_model, feature_names, model_load_error
    logger.info("Attempting to load ML model and feature names...")
    model_load_error = None
    lgbm_model = None
    feature_names = None
    loaded_model = None
    loaded_feature_names = None

    try:
        model_path = config.ML_MODEL_PATH
        features_path = config.ML_FEATURES_PATH
        logger.debug(f"Model path: {model_path}")
        logger.debug(f"Features path: {features_path}")

        if not model_path.is_file():
            raise FileNotFoundError(f"ML Model file not found at configured path: {model_path}")
        if not features_path.is_file():
            raise FileNotFoundError(f"ML Feature names file not found at configured path: {features_path}")
        logger.info("Model and features files found.")

        start_time = time.time()
        logger.debug(f"Loading model from {model_path}...")
        loaded_model = joblib.load(model_path)
        logger.info(f"Model loaded. Type: {type(loaded_model)}")

        logger.debug(f"Loading features from {features_path}...")
        loaded_feature_names = joblib.load(features_path)
        logger.info(f"Features loaded. Type: {type(loaded_feature_names)}")
        load_time = time.time() - start_time
        logger.debug(f"File loading took {load_time:.4f} seconds.")

        logger.debug("Validating loaded model type...")
        if not isinstance(loaded_model, (lgb.basic.Booster, lgb.LGBMClassifier)):
            raise TypeError(f"Loaded model file '{model_path.name}' did not contain a valid LightGBM Booster or Classifier. Found type: {type(loaded_model)}.")
        logger.info(f"Model type validation successful. Found: {type(loaded_model).__name__}")

        logger.debug("Validating loaded features type...")
        if not isinstance(loaded_feature_names, list): # Check against built-in list type
            raise TypeError(f"Loaded features file '{features_path.name}' did not contain a list. Found type: {type(loaded_feature_names)}.")
        logger.info("Features type validation successful (is list).")

        logger.debug("Validating features content...")
        if not loaded_feature_names:
            raise ValueError(f"Loaded features file '{features_path.name}' contained an empty list.")
        if not all(isinstance(n, str) for n in loaded_feature_names):
            non_str_items = [item for item in loaded_feature_names if not isinstance(item, str)]
            raise TypeError(f"Loaded features list in '{features_path.name}' contains non-string elements. First few non-strings: {non_str_items[:5]}")
        logger.info(f"Features content validation successful ({len(loaded_feature_names)} string features found).")

        logger.debug("Assigning loaded objects to global variables...")
        lgbm_model = loaded_model
        feature_names = loaded_feature_names # Assign the loaded list
        logger.info(f"Successfully loaded and validated LightGBM model from: {model_path.name}")
        logger.info(f"Successfully loaded and validated {len(feature_names)} feature names from: {features_path.name}")
        logger.debug(f"Global lgbm_model type after assignment: {type(lgbm_model)}")
        logger.debug(f"Global feature_names type after assignment: {type(feature_names)}")

    except FileNotFoundError as e:
        logger.error(f"ML Model Loading Error: {e}")
        model_load_error = str(e)
    except (joblib.externals.loky.process_executor.TerminatedWorkerError, EOFError, TypeError, ValueError) as e:
        logger.error(f"ML Model Loading Error: Failed to load or validate joblib file. Error: {e}", exc_info=True)
        model_load_error = f"Failed to load/validate joblib file ({type(e).__name__}): {e}"
    except Exception as e:
        logger.exception(f"ML Model Loading Error: An unexpected error occurred during loading.")
        model_load_error = f"Unexpected loading error: {type(e).__name__}"
        lgbm_model = None
        feature_names = None

    if lgbm_model is None or feature_names is None:
        logger.error("ML Model or feature names are still None after loading attempt.")
        if not model_load_error:
            model_load_error = "Model/features failed to load correctly. Check logs for details."
            logger.error(f"Setting generic load error: {model_load_error}")
        else:
            logger.error(f"Load failed with specific error: {model_load_error}")
    else:
        logger.info("Final check confirms model and features are loaded into global variables.")


# --- Dependency for Model Access ---
# Use Tuple from typing for the return type hint
def get_model_and_features() -> Tuple[Union[lgb.basic.Booster, lgb.LGBMClassifier], List[str]]:
    """
    FastAPI dependency to provide the loaded model and features.
    Raises HTTPException 503 if the model isn't ready.
    """
    global lgbm_model, feature_names, model_load_error
    if model_load_error:
        logger.warning(f"ML Model access denied: Loading previously failed with error: {model_load_error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ML Model Service Unavailable: {model_load_error}",
        )
    # Check if model or feature_names are None (which they shouldn't be if load was successful)
    if lgbm_model is None or feature_names is None:
        logger.critical("ML Model access denied: Model or features are None, but no specific load error was recorded. Check startup logs.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model Service Unavailable: Model not loaded correctly. Check server logs.",
        )
    # Return the loaded objects if they are ready
    return lgbm_model, feature_names

# --- API Endpoints ---

@router.post(
    "/analyze",
    response_model=MLAnalysisResult,
    summary="Analyze password strength using ML model",
    description="Receives a password, extracts features matching the trained model, predicts strength (0-4) using the pre-trained LightGBM model, and returns probabilities.",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "ML Model is not loaded or unavailable"},
        status.HTTP_400_BAD_REQUEST: {"description": "Error during feature extraction (e.g., internal error, invalid input leading to feature error)"},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Invalid input payload (e.g., missing 'password' field)"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Unexpected internal error during analysis (e.g., prediction failure, feature mismatch)"},
    }
)
async def analyze_password_ml(
    payload: PasswordInput,
    # Use dependency injection to ensure model is ready and get access to it
    model_data: Tuple[Union[lgb.basic.Booster, lgb.LGBMClassifier], List[str]] = Depends(get_model_and_features) # Use Tuple type hint
):
    """
    Analyzes the password using the loaded LightGBM model and feature extractor.
    """
    lgbm_model_dep, feature_names_dep = model_data
    password = payload.password
    logger.info(f"Received request to analyze password (length: {len(password)}) with ML model.")

    analysis_start_time = time.time()

    try:
        logger.debug("Extracting features...")
        extract_start_time = time.time()
        features_df = extract_features(password, feature_names_dep)
        extract_time = time.time() - extract_start_time
        logger.debug(f"Feature extraction complete in {extract_time:.6f} seconds. DataFrame shape: {features_df.shape}")

        if not isinstance(features_df, pd.DataFrame):
             raise TypeError(f"Feature extraction returned unexpected type: {type(features_df)}")
        if features_df.shape[0] != 1:
             raise ValueError(f"Feature extraction did not return exactly one row. Shape: {features_df.shape}")
        if features_df.shape[1] != len(feature_names_dep):
             raise ValueError(f"Feature extraction returned wrong number of columns. Expected {len(feature_names_dep)}, Got {features_df.shape[1]}")

        extracted_columns = features_df.columns.tolist()
        if extracted_columns != feature_names_dep:
             logger.error("CRITICAL FEATURE MISMATCH DETECTED POST-EXTRACTION!")
             logger.error(f"--> Expected features (from {config.ML_FEATURES_PATH.name}): {feature_names_dep}")
             logger.error(f"--> Actual features extracted: {extracted_columns}")
             logger.error("Ensure feature_extractor.py calculates and orders features exactly as defined in feature_names.joblib used for training.")
             raise RuntimeError("Internal Server Error: Feature mismatch between extraction logic and loaded feature names.")

        features_for_prediction = features_df

        logger.debug("Performing model prediction...")
        pred_start_time = time.time()

        if isinstance(lgbm_model_dep, lgb.basic.Booster):
            logger.debug("Using Booster.predict method.")
            predicted_probabilities_array = lgbm_model_dep.predict(
                features_for_prediction.values,
                num_iteration=getattr(lgbm_model_dep, 'best_iteration', -1) # Use best_iteration if exists
            )
        elif isinstance(lgbm_model_dep, lgb.LGBMClassifier):
            logger.debug("Using LGBMClassifier.predict_proba method.")
            predicted_probabilities_array = lgbm_model_dep.predict_proba(
                features_for_prediction
            )
        else:
            raise TypeError(f"Unsupported model type for prediction: {type(lgbm_model_dep)}")

        pred_time = time.time() - pred_start_time
        logger.debug(f"Model prediction took {pred_time:.6f} seconds")

        if predicted_probabilities_array.ndim != 2 or predicted_probabilities_array.shape[0] != 1:
             raise ValueError(f"Model prediction returned unexpected shape: {predicted_probabilities_array.shape}")

        probabilities = predicted_probabilities_array[0]
        predicted_score = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_score])

        num_classes = 5
        if len(probabilities) != num_classes:
            logger.warning(f"Prediction returned {len(probabilities)} probabilities, expected {num_classes}. Padding/truncating.")
            adjusted_probs = np.zeros(num_classes)
            limit = min(len(probabilities), num_classes)
            adjusted_probs[:limit] = probabilities[:limit]
            probabilities = adjusted_probs

        probabilities_dict = {f"Score {i}": float(prob) for i, prob in enumerate(probabilities)}

        strength_label_base = STRENGTH_LABELS.get(predicted_score, "Unknown Score")
        strength_emoji = STRENGTH_EMOJIS.get(predicted_score, "❓")
        predicted_strength_label = f"{strength_emoji} {strength_label_base} (Score: {predicted_score})"

        analysis_time_seconds = time.time() - analysis_start_time
        logger.info(f"ML analysis completed in {analysis_time_seconds:.4f} seconds. Predicted Score: {predicted_score}, Confidence: {confidence:.4f}")

        result = MLAnalysisResult(
            predicted_strength_label=predicted_strength_label,
            predicted_strength_score=predicted_score,
            confidence=confidence,
            probabilities=probabilities_dict,
            analysis_time_seconds=round(analysis_time_seconds, 6),
        )
        return result

    except ValueError as e:
        logger.error(f"Value error during ML analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error during feature processing or validation: {e}",
        )
    except TypeError as e:
        logger.error(f"Type error during ML analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal type error during analysis: {e}",
        )
    except RuntimeError as e:
         logger.error(f"Runtime error during ML analysis: {e}", exc_info=True)
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail=str(e),
         )
    except Exception as e:
        logger.exception("Unexpected error during ML password analysis.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred during ML analysis: {type(e).__name__}",
        )


@router.get(
    "/health",
    summary="Check ML Analyzer Health",
    description="Checks if the ML model and feature names were loaded successfully during startup.",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, Any], # Use imported Dict
)
async def health_check():
    """Provides the loading status of the ML model and features."""
    global lgbm_model, feature_names, model_load_error
    status_info = {"status": "unknown", "message": "Checking status..."}

    if model_load_error:
        status_info["status"] = "error"
        status_info["message"] = f"Model loading failed: {model_load_error}"
        logger.warning(f"ML Analyzer health check: Not ready. Reason: {model_load_error}")
    elif lgbm_model and feature_names:
        status_info["status"] = "ready"
        status_info["message"] = f"Ready: LightGBM model ({type(lgbm_model).__name__}) and {len(feature_names)} features loaded successfully."
        logger.info(f"ML Analyzer health check: Ready.")
    else:
        status_info["status"] = "error"
        status_info["message"] = "Model or features not loaded. Check startup logs for details."
        logger.error(f"ML Analyzer health check: Not ready. Model/features are None, but no specific error logged.")

    return status_info