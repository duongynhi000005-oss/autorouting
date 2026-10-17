import { describe, expect, test } from "bun:test"
import { getSolverProblemUrl } from "../../frontend/components/DatasetNavigation"

describe("getSolverProblemUrl", () => {
  test("automatically opens keyboards/1 when selecting an algorithm on the main page", () => {
    expect(
      getSolverProblemUrl({
        selectedProblemType: undefined,
        seedStr: undefined,
        solverName: "multilayer-ijump",
        problemTypes: ["single-trace", "traces", "keyboards"],
      }),
    ).toBe("/problem/keyboards/1/multilayer-ijump")
  })

  test("falls back to first available dataset when keyboards is not in problemTypes", () => {
    expect(
      getSolverProblemUrl({
        selectedProblemType: undefined,
        seedStr: undefined,
        solverName: "simple-grid",
        problemTypes: ["single-trace", "traces"],
      }),
    ).toBe("/problem/single-trace/1/simple-grid")
  })

  test("preserves selectedProblemType and seedStr when already viewing a problem", () => {
    expect(
      getSolverProblemUrl({
        selectedProblemType: "traces",
        seedStr: "5",
        solverName: "infgrid-ijump-astar",
        problemTypes: ["single-trace", "traces", "keyboards"],
      }),
    ).toBe("/problem/traces/5/infgrid-ijump-astar")
  })
})
