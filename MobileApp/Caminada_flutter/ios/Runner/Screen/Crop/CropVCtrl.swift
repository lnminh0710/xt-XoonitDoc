//
//  CropVCtrl.swift
//  Runner
//
//  Created by I on 5/18/20.
//  Copyright © 2020 The Chromium Authors. All rights reserved.
//

import UIKit
import Common

class CropVCtrl: UIViewController {
    
    @IBOutlet weak var vContent: UIView!
    @IBOutlet weak var btnAccept: UIButton!
    
    private var image: UIImage
    private var quad: Quadrilateral?
    private var cropDocVCtrl: CropDocumentVCtrl?
    
    var done:((String) -> ())? = nil
    
    init(image: UIImage, quad: Quadrilateral?) {
        self.image = image
        self.quad = quad
        super.init(nibName: "CropVCtrl", bundle: .main)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        cropDocVCtrl = CropDocumentVCtrl(image: image, quad: quad)
        cropDocVCtrl!.view.frame = vContent.bounds
        vContent.addSubview(cropDocVCtrl!.view)
        
        addChild(cropDocVCtrl!)
        cropDocVCtrl!.didMove(toParent: self)
        cropDocVCtrl!.delegate = self
    }
    
    func saveImage(image: UIImage?){
        let name = "\(UUID.init().uuidString).png"
        if let data = image?.pngData(), let imagePath = NSURL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(name) {
            do {
                try data.write(to: URL(fileURLWithPath: imagePath.path), options: .atomic)
                done?(imagePath.path)
            } catch {
                debugPrint("Save image file:", error)
            }
        }
        
        cropDocVCtrl?.dismiss(animated: true, completion: nil)
    }
    
    @IBAction func btnDelete_Touched(_ sender: UIButton) {
        dismiss(animated: true, completion: nil)
    }
    
    
    @IBAction func btnAccept_Touched(_ sender: UIButton) {
        cropDocVCtrl?.done()
    }
}

extension CropVCtrl: CropDocumentDelegate {
    func done(image: UIImage?) {
        saveImage(image: image)
    }
}

