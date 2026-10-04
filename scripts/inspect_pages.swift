import Foundation
import PDFKit

let pdfURL = URL(fileURLWithPath: "salon_kilavuzu.pdf")
if let doc = PDFDocument(url: pdfURL) {
    print("Total pages:", doc.pageCount)
    for i in 0..<doc.pageCount {
        if let page = doc.page(at: i) {
            let str = page.string ?? ""
            let firstLine = str.components(separatedBy: .newlines).filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }.prefix(3).joined(separator: " | ")
            print("Page \(i+1): \(firstLine)")
        }
    }
}
