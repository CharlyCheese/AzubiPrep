// Pinned QuickJS 0.32.0: the ordinary executePendingJobs and its MaybeAsync FFI
// use a numeric cwrap fast path which does not await Asyncify. Explicit async
// cwrap is required. Only call this after the preceding evaluation has settled.
export function createAsyncJobRunner(runtime, vm) {
  const execute = runtime.module.cwrap('QTS_ExecutePendingJob', 'number', ['number', 'number', 'number'], { async: true });
  let active = false;
  return async () => {
    if (active) throw new Error('Eine Promise-Aufgabe läuft bereits.');
    active = true;
    const out = runtime.memory.newMutablePointerArray(1);
    let pointer;
    try {
      pointer = await execute(runtime.rt.value, 1, out.value.ptr);
      // WASM growth detaches earlier views. Read from the current heap only.
      const context = new Int32Array(runtime.module.HEAPU8.buffer, out.value.ptr, 1)[0];
      if (context === 0) { runtime.ffi.QTS_FreeValuePointerRuntime(runtime.rt.value, pointer); pointer = undefined; return 0; }
      if (context !== vm.ctx.value) throw new Error('Unbekannter Promise-Kontext.');
      const handle = vm.getMemory(runtime.rt.value).heapValueHandle(pointer); pointer = undefined;
      try {
        if (vm.typeof(handle) !== 'number') throw new Error('Promise-Aufgabe konnte nicht ausgeführt werden.');
        const count = vm.getNumber(handle);
        if (count !== 1) throw new Error('Ungültige Promise-Aufgabenanzahl.');
        return count;
      } finally { handle.dispose(); }
    } finally {
      if (pointer !== undefined) runtime.ffi.QTS_FreeValuePointerRuntime(runtime.rt.value, pointer);
      out.dispose(); active = false;
    }
  };
}
