from typing import Optional, List

def evaluate_item_status(
    result_value: str,
    ref_min: Optional[float] = None,
    ref_max: Optional[float] = None,
) -> str:
    val_str = str(result_value).strip().lower()

    # 1. Qualitative results (text-based tests)
    if val_str in ["positive", "reactive", "detected", "abnormal", "present"]:
        return "Abnormal"
    if val_str in ["negative", "non-reactive", "not detected", "normal", "absent", "nil", "clear"]:
        return "Normal"

    # 2. Quantitative results (numeric range)
    try:
        num = float(result_value)
        if ref_min is not None and num < ref_min:
            return "Abnormal"
        if ref_max is not None and num > ref_max:
            return "Abnormal"
        return "Normal"
    except (ValueError, TypeError):
        # Default fallback for unrecognized non-numeric descriptions
        return "Normal"

def compute_overall_status(items_status: List[str]) -> str:
    if any(s == "Abnormal" for s in items_status):
        return "Abnormal"
    return "Normal"

def compute_status(result_value: float, ref_min: float, ref_max: float) -> str:
    """Legacy helper for backward compatibility."""
    return evaluate_item_status(str(result_value), ref_min, ref_max)
