export function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    let totalLength = 0;
    for (let i: i32 = 0; i < arrays.length; i++) {
        totalLength += arrays[i].length;
    }

    let shift = 0;
    const c = new Uint8Array(totalLength);
    for (let i: i32 = 0; i < arrays.length; i++) {
        memory.copy(c.dataStart + shift, arrays[i].dataStart, arrays[i].length);
        shift += arrays[i].length;
    }

    return c;
}

export function u8ToUint8Array(a: u8): Uint8Array {
    const arr = new Uint8Array(1);
    arr[0] = a;
    return arr;
}