"""Comprehensive Multi-Trial Clinical Screening Benchmark Suite.

Executes all 100 MIMIC-III demo patients across 3 clinical trials:
  1. NCT00005143 - Metformin Diabetes Protocol
  2. NCT00262600 - Warfarin Anticoagulation Protocol
  3. NCT00000560 - Lisinopril Hypertension Protocol

Measures latency, throughput, decision breakdown, and agent metrics.
"""

import time
import json
from pathlib import Path
from app.db.loaders import load_mimic_cohort
from app.api.router import DEMO_TRIALS
from app.agents.orchestrator import run_recruitment_pipeline


def run_benchmark():
    print("=" * 70)
    print("MULTI-TRIAL CLINICAL RECRUITMENT SCREENING BENCHMARK")
    print("=" * 70)

    # 1. Load 100 patients
    t0 = time.perf_counter()
    patients = load_mimic_cohort(limit=9999)
    load_time = time.perf_counter() - t0
    patient_count = len(patients)
    print(f"Loaded {patient_count} MIMIC-III patient profiles in {load_time:.3f}s")
    print("-" * 70)

    trials_to_run = [
        ("NCT00005143", "Metformin (Diabetes)"),
        ("NCT00262600", "Warfarin (Anticoagulation)"),
        ("NCT00000560", "Lisinopril (Hypertension)"),
    ]

    total_screenings = 0
    total_screen_time = 0.0
    summary_results = {}

    for trial_id, trial_desc in trials_to_run:
        trial = DEMO_TRIALS[trial_id]
        print(f"\nExecuting Benchmark for: {trial_id} - {trial_desc}")
        print(f"Criteria: {trial.get('total_criteria', 25)}+ rules | Medicine: {trial.get('medicine')}")

        latencies_ms = []
        counts = {"ELIGIBLE": 0, "REVIEW_REQUIRED": 0, "INELIGIBLE": 0}
        confidences = {"ELIGIBLE": [], "REVIEW_REQUIRED": [], "INELIGIBLE": []}
        rounds_counts = []

        start_trial_time = time.perf_counter()
        for p in patients:
            p_start = time.perf_counter()
            res = run_recruitment_pipeline(p, trial)
            p_latency = (time.perf_counter() - p_start) * 1000.0
            latencies_ms.append(p_latency)

            status = res["status"]
            counts[status] = counts.get(status, 0) + 1
            confidences[status].append(res["confidence"])
            rounds_counts.append(res.get("consensus", {}).get("rounds_executed", 1))

        trial_duration = time.perf_counter() - start_trial_time
        total_screen_time += trial_duration
        total_screenings += patient_count

        avg_lat = sum(latencies_ms) / len(latencies_ms)
        sorted_lat = sorted(latencies_ms)
        p50_lat = sorted_lat[int(len(sorted_lat) * 0.50)]
        p95_lat = sorted_lat[int(len(sorted_lat) * 0.95)]
        throughput = patient_count / trial_duration

        avg_conf = {
            k: (round(sum(v) / len(v), 3) if v else 0.0)
            for k, v in confidences.items()
        }

        print(f"  Duration:         {trial_duration:.2f} s")
        print(f"  Throughput:       {throughput:.1f} patients/sec")
        print(f"  Latency (Avg):    {avg_lat:.2f} ms")
        print(f"  Latency (p50):    {p50_lat:.2f} ms")
        print(f"  Latency (p95):    {p95_lat:.2f} ms")
        print(f"  Eligible:         {counts['ELIGIBLE']} (avg conf: {avg_conf['ELIGIBLE']:.2f})")
        print(f"  Review Required:  {counts['REVIEW_REQUIRED']} (avg conf: {avg_conf['REVIEW_REQUIRED']:.2f})")
        print(f"  Ineligible:       {counts['INELIGIBLE']} (avg conf: {avg_conf['INELIGIBLE']:.2f})")
        print(f"  Avg Consensus Rounds: {sum(rounds_counts) / len(rounds_counts):.1f}")

        summary_results[trial_id] = {
            "title": trial.get("title"),
            "medicine": trial.get("medicine"),
            "patients": patient_count,
            "duration_sec": round(trial_duration, 3),
            "throughput_pts_per_sec": round(throughput, 1),
            "latency_ms": {
                "avg": round(avg_lat, 2),
                "p50": round(p50_lat, 2),
                "p95": round(p95_lat, 2),
            },
            "cohort_breakdown": counts,
            "average_confidences": avg_conf,
            "avg_deliberation_rounds": round(sum(rounds_counts) / len(rounds_counts), 2),
        }

    overall_throughput = total_screenings / total_screen_time
    print("\n" + "=" * 70)
    print("GLOBAL MULTI-TRIAL BENCHMARK SUMMARY")
    print("=" * 70)
    print(f"Total Patient Screenings Evaluated: {total_screenings}")
    print(f"Total Processing Time:              {total_screen_time:.2f} s")
    print(f"Overall Throughput:                 {overall_throughput:.1f} evaluations/sec")
    print("=" * 70)

    out_file = Path(__file__).resolve().parent / "benchmark_results.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_screenings": total_screenings,
            "total_duration_sec": round(total_screen_time, 3),
            "overall_throughput_pts_per_sec": round(overall_throughput, 1),
            "trials": summary_results,
        }, f, indent=2)

    print(f"\nBenchmark results saved to: {out_file}")
    return summary_results


if __name__ == "__main__":
    run_benchmark()
