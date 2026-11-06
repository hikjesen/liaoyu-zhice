import {it,expect} from 'vitest';
import {makeReport} from '../src/services/report';
import {demoInputs} from '../src/engine/rules';
import {normalizeInputs} from '../src/engine/evaluator';
import snapshot from '../src/data/snapshots/changhai-demo.json';
import type {Snapshot} from '../src/engine/types';
it('exports reproducible original inputs and rule evidence',()=>{const inputs=demoInputs({temperature:26});const r=makeReport(inputs,snapshot as Snapshot,{id:'changhai-demo'},[]);expect(r.schemaVersion).toBe(1);expect(normalizeInputs(r.inputs)).toEqual(inputs);expect(r.assessment.outside).toBe(1);expect(r.sources.length).toBeGreaterThanOrEqual(5);expect(r.marine.fetchedAt).toBe(snapshot.fetchedAt);});
it('isolates report input snapshot from later mutations',()=>{const inputs=demoInputs();const r=makeReport(inputs,snapshot as Snapshot,{},[]);inputs.temperature.value=28;expect(r.inputs.temperature.value).toBe(18);});
