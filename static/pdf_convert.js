async function rearrangePDF() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const fileReader = new FileReader();

    fileReader.onload = async function () {
        const arrayBuffer = this.result;
        const typedArray = new Uint8Array(arrayBuffer);

        const pdfDoc = await PDFLib.PDFDocument.load(typedArray);
        const totalPages = pdfDoc.getPageCount();

        let pageOrder = [];

        for (let i = 1; i <= totalPages; i += 3) {
            if (i + 2 <= totalPages) {
                pageOrder.push(i);
                pageOrder.push(i + 2);
                pageOrder.push(i + 1);
            } else {
                for (let j = i; j <= totalPages; j++) {
                    pageOrder.push(j);
                }
            }
        }

        const mergedPdfData = await mergePDFs(pdfDoc, pageOrder);

        const blob = new Blob([mergedPdfData], {type: 'application/pdf'});
        const downloadLink = document.getElementById('downloadLink');
        const fileName = file.name.replace(/(\.pdf)$/i, '_converter$1');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        document.getElementById('downloadLinkContainer').style.display = 'block';
    };

    fileReader.readAsArrayBuffer(file);
}

async function mergePDFs(pdfDoc, pageOrder) {
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (let i = 0; i < pageOrder.length; i++) {
        const pageNum = pageOrder[i];
        const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [pageNum - 1]);
        mergedPdf.addPage(copiedPage);
    }

    const mergedPdfBytes = await mergedPdf.save();
    return mergedPdfBytes;
}