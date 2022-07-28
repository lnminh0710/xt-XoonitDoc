//
//  ScannerVCtrl.swift
//  Runner
//
//  Created by I on 4/27/20.
//  Copyright © 2020 The Chromium Authors. All rights reserved.
//

import UIKit
import Common

class ScannerVCtrl: UIViewController {
    
    @IBOutlet weak var vContent: UIView!
    @IBOutlet weak var btnTotal: UIButton!
    
    var result: FlutterResult?
    
    private let documentScannerVCtrl = DocumentScannerVCtrl()
    
    private var lsPath: [String] = [] {
        didSet {
            total = lsPath.count
        }
    }
    
    private var total = 0 {
        didSet {
            btnTotal.setTitle("\(total)", for: .normal)
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        documentScannerVCtrl.view.frame = vContent.bounds
        vContent.addSubview(documentScannerVCtrl.view)
        
        addChild(documentScannerVCtrl)
        documentScannerVCtrl.didMove(toParent: self)
        
        NSLayoutConstraint.activate([
            documentScannerVCtrl.view.topAnchor.constraint(equalTo: vContent.topAnchor),
            documentScannerVCtrl.view.bottomAnchor.constraint(equalTo: vContent.bottomAnchor),
            documentScannerVCtrl.view.trailingAnchor.constraint(equalTo: vContent.trailingAnchor),
            documentScannerVCtrl.view.leadingAnchor.constraint(equalTo: vContent.leadingAnchor)
        ])
        
        documentScannerVCtrl.done = { i, q in
            let cropVCtrl = CropVCtrl(image: i,quad: q)
            cropVCtrl.modalPresentationStyle = .fullScreen
            self.present(cropVCtrl, animated: true, completion: nil)
            
            cropVCtrl.done = { path in
                self.lsPath.append(path)
            }
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.navigationController?.setNavigationBarHidden(true, animated: true)
        
        btnTotal.layer.cornerRadius = btnTotal.frame.height/2
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        self.navigationController?.setNavigationBarHidden(true, animated: true)
    }
    
    @IBAction func btnGallery_Touched(_ sender: UIButton) {
        result?(lsPath)
        navigationController?.popToRootViewController(animated: true)
    }
    
    @IBAction func btnCapture_Touched(_ sender: UIButton) {
        documentScannerVCtrl.capturePhoto()
    }
}
