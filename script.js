async function removeMetadata() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const arrayBuffer = e.target.result;
        const cleanedBuffer = cleanBuffer(arrayBuffer);
        const blob = new Blob([cleanedBuffer], { type: file.type });
        const newFile = new File([blob], file.name, { type: file.type });

        const url = URL.createObjectURL(newFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
    };
    reader.readAsArrayBuffer(file);
}

function cleanBuffer(arrayBuffer) {
    let dataView = new DataView(arrayBuffer);
    const exifMarker = 0xffe1;
    let offset = 2; // Skip the first two bytes (0xFFD8)

    while (offset < dataView.byteLength) {
        if (dataView.getUint16(offset) === exifMarker) {
            const segmentLength = dataView.getUint16(offset + 2, false) + 2;
            arrayBuffer = removeSegment(arrayBuffer, offset, segmentLength);
            dataView = new DataView(arrayBuffer);
        } else {
            offset += 2 + dataView.getUint16(offset + 2, false);
        }
    }
    return arrayBuffer;
}

function removeSegment(buffer, offset, length) {
    const modifiedBuffer = new Uint8Array(buffer.byteLength - length);
    modifiedBuffer.set(new Uint8Array(buffer.slice(0, offset)), 0);
    modifiedBuffer.set(new Uint8Array(buffer.slice(offset + length)), offset);
    return modifiedBuffer.buffer;
}
