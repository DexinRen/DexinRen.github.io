def _normalize_loss_mask_policy(raw, default: str = "Q1=8pt") -> str:
    """Normalize and validate loss-mask policy token.

    Supported canonical values:
      - Q1=8pt: keep current head-masked policy.
      - Q1=0pt: disable head masking (all points weighted equally).
    """
    token = str(raw if raw is not None else "").strip().lower().replace(" ", "")
    if token in {"", "q1=8pt", "q1=8"}:
        return "Q1=8pt"
    if token in {"q1=0pt", "q1=0", "none", "nomask", "no_mask"}:
        return "Q1=0pt"
    raise ValueError(
        f"Unsupported loss_mask_policy={raw!r}. "
        "Supported values: Q1=8pt, Q1=0pt."
    )


def build_loss_mask(K: int, loss_mask_policy: str):
    """
    Purpose:
        Create the per-point loss mask for training based on policy.

        Policy: Q1=8pt
            HEAD (0..7):
                weight = 0.0  # all head points are attachment buckle

            BODY (8..K-1):
                weight = 1.0

        Policy: Q1=0pt
            all points weight = 1.0 (no loss masking)

    Inputs:
        K : int, chunk size (default = 256)

    Output:
        mask : Tensor(K,)

    Notes:
        - Mask applied inside train_step().
        - Stored in runtime["loss_mask"].
    """

    policy = _normalize_loss_mask_policy(loss_mask_policy)

    # allocate full mask
    mask = torch.ones(K, dtype=torch.float32)

    # ------------------------------------------------------------
    # Policy: no mask
    # ------------------------------------------------------------
    if policy == "Q1=0pt":
        return mask

    # ------------------------------------------------------------
    # Policy: Q1=8pt
    # HEAD REGION: p = 0..7 (all zero)
    # ------------------------------------------------------------
    mask[:8] = 0.0

    # ------------------------------------------------------------
    # BODY REGION: p = 8..K-1 (fully weighted = 1.0)
    # Tail masking was removed; only the head attachment buckle stays masked.
    # No operation needed since initialized to ones

    return mask
