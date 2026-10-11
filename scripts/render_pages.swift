import Foundation
import PDFKit
import AppKit

let pdfURL = URL(fileURLWithPath: "salon_kilavuzu.pdf")
guard let document = PDFDocument(url: pdfURL) else { exit(1) }

for p in [0, 1, 2, 3, 4, 5] {
    if let page = document.page(at: p) {
        let pageRect = page.bounds(for: .mediaBox)
        let image = page.thumbnail(of: CGSize(width: pageRect.width * 1.5, height: pageRect.height * 1.5), for: .mediaBox)
        if let tiffData = image.tiffRepresentation,
           let bitmapImage = NSBitmapImageRep(data: tiffData),
           let pngData = bitmapImage.representation(using: .png, properties: [:]) {
            try? pngData.write(to: URL(fileURLWithPath: "page_\(p+1).png"))
            print("Rendered page_\(p+1).png, text length: \(page.string?.count ?? 0)")
        }
    }
}
