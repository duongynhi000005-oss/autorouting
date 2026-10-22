import { MultilayerIjump } from "algos/multi-layer-ijump/MultilayerIjump"
import { test, expect } from "bun:test"
import { getSimpleRouteJson } from "solver-utils"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("repro3: multilayer ijump removes wild trace jumps when overcoming obstacles", () => {
  const circuitJson: any = [
    {
      type: "source_port",
      source_port_id: "port_1",
      name: "pin1",
      source_component_id: "c1",
    },
    {
      type: "source_port",
      source_port_id: "port_2",
      name: "pin2",
      source_component_id: "c2",
    },
    {
      type: "source_trace",
      source_trace_id: "trace_1",
      connected_source_port_ids: ["port_1", "port_2"],
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_c1",
      source_component_id: "c1",
      center: { x: -6, y: 0 },
      width: 2,
      height: 1,
      layer: "top",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_c2",
      source_component_id: "c2",
      center: { x: 6, y: 0 },
      width: 2,
      height: 1,
      layer: "top",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_obstacle",
      source_component_id: "c_obs",
      center: { x: 0, y: 0 },
      width: 4,
      height: 3,
      layer: "top",
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_1",
      shape: "rect",
      x: -6,
      y: 0,
      width: 1,
      height: 1,
      layer: "top",
      port_hints: ["pin1"],
    },
    {
      type: "pcb_port",
      pcb_port_id: "pcb_port_1",
      source_port_id: "port_1",
      x: -6,
      y: 0,
      layers: ["top"],
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_2",
      shape: "rect",
      x: 6,
      y: 0,
      width: 1,
      height: 1,
      layer: "top",
      port_hints: ["pin2"],
    },
    {
      type: "pcb_port",
      pcb_port_id: "pcb_port_2",
      source_port_id: "port_2",
      x: 6,
      y: 0,
      layers: ["top"],
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_obs",
      shape: "rect",
      x: 0,
      y: 0,
      width: 4,
      height: 3,
      layer: "top",
    },
  ]

  const input = getSimpleRouteJson(circuitJson, { layerCount: 2 })
  const autorouter = new MultilayerIjump({
    input,
    layerCount: 2,
    isRemovePathLoopsEnabled: true,
    isShortenPathWithShortcutsEnabled: true,
  })

  const traces = autorouter.solveAndMapToTraces()
  expect(traces).toHaveLength(1)

  // Verify that the route does not contain any wild jumps
  const route = traces[0].route
  expect(route.length).toBeGreaterThan(0)
  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i]
    const p2 = route[i + 1]
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    const segLen = Math.sqrt(dx * dx + dy * dy)
    // No segment should jump across the board (> 15mm)
    expect(segLen).toBeLessThan(15)
  }

  // Debug snapshot test
  const svg = convertCircuitJsonToPcbSvg(circuitJson.concat(traces as any))
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
