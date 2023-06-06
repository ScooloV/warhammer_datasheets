async function rearrangePDF() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const fileReader = new FileReader();

    fileReader.onload = async function () {
        const arrayBuffer = this.result;
        const typedArray = new Uint8Array(arrayBuffer);

        const pdfDoc = await PDFLib.PDFDocument.load(typedArray);
        const totalPages = pdfDoc.getPageCount();
        const totalPages_4 = Math.ceil(totalPages / 4) * 4

        let pageOrder = [];

        for (let i = 1; i <= totalPages_4; i += 4) {
            pageOrder.push(i);
            pageOrder.push(i + 2);
            pageOrder.push(i + 1);
            pageOrder.push(i + 3);
        }

        const mergedPdfData = await mergePDFs(pdfDoc, pageOrder);

        const blob = new Blob([mergedPdfData], {type: 'application/pdf'});
        const downloadLink = document.getElementById('downloadLink');
        const fileName = file.name.replace(/(\.pdf)$/i, '_converted$1');
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
        if (pageNum !== null && pageNum <= pdfDoc.getPageCount()) {
            const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [pageNum - 1]);
            mergedPdf.addPage(copiedPage);
        } else {
            const firstPage = pdfDoc.getPages()[0];
            const {width, height} = firstPage.getSize();
            const blankPage = mergedPdf.addPage([width, height]);
        }
    }

    const mergedPdfBytes = await mergedPdf.save();
    return mergedPdfBytes;
}
