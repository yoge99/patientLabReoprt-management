def compute_status(result_value: float, ref_min: float, ref_max: float) -> str:
    if result_value < ref_min or result_value > ref_max:
        return "Abnormal"
    return "Normal"