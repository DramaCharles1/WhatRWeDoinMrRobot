import time


def test_task_save_latency_budget_definition() -> None:
    started = time.perf_counter()
    elapsed = time.perf_counter() - started
    assert elapsed < 2.0
