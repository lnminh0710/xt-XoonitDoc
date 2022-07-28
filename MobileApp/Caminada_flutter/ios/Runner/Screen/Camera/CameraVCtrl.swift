//
//  CameraVCtrl.swift
//  Caminada
//
//  Created by N on 2/20/20.
//  Copyright © 2020 N. All rights reserved.
//

import UIKit
import Common

class CameraVCtrl: UIViewController, UIAdaptivePresentationControllerDelegate {
    
    @IBOutlet weak var vCamera: UIView!
    @IBOutlet weak var scvCate: UIScrollView!
    @IBOutlet weak var btnTotal: UIButton!
    
    private var lsButton: [UIButton] = []
    private var lsDocTree: [DocumentTree] = []
    private let documentScannerVCtrl = DocumentScannerVCtrl()
    
    var result: FlutterResult?
    
    init(json: String?) {
        if let data = json?.data(using: .utf8){
            lsDocTree = (try? JSONDecoder().decode([DocumentTree].self, from: data)) ?? []
        }
        
        super.init(nibName: "CameraVCtrl", bundle: Bundle.init(for: CameraVCtrl.self))
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private var lsResult: [ImageResult] = [] {
        didSet {
            total = lsResult.count
            btnTotal.isHidden = lsResult.isEmpty
        }
    }
    
    private var total = 0 {
        didSet {
            btnTotal.setTitle("\(total)", for: .normal)
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        initCate()
        
        documentScannerVCtrl.view.frame = vCamera.bounds
        vCamera.addSubview(documentScannerVCtrl.view)
        
        addChild(documentScannerVCtrl)
        documentScannerVCtrl.didMove(toParent: self)
        
        NSLayoutConstraint.activate([
            documentScannerVCtrl.view.topAnchor.constraint(equalTo: vCamera.topAnchor),
            documentScannerVCtrl.view.bottomAnchor.constraint(equalTo: vCamera.bottomAnchor),
            documentScannerVCtrl.view.trailingAnchor.constraint(equalTo: vCamera.trailingAnchor),
            documentScannerVCtrl.view.leadingAnchor.constraint(equalTo: vCamera.leadingAnchor)
        ])
        
        documentScannerVCtrl.done = { [weak self] i, q in
            guard let self = self else {
                return
            }
            
            let cropVCtrl = CropVCtrl(image: i,quad: q)
            cropVCtrl.modalPresentationStyle = .fullScreen
            self.present(cropVCtrl, animated: true, completion: nil)
            
            cropVCtrl.done = { [weak self] path in
                guard let self = self else {
                    return
                }
                let btn = self.lsButton.first(where: {$0.isSelected})
                let result = ImageResult(idDocumentTree: btn?.tag, imgPath: path)
                self.lsResult.append(result)
            }
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        btnTotal.layer.cornerRadius = btnTotal.frame.height/2
    }
    
    private func initCate(){
        lsButton.removeAll()
        scvCate.subviews.forEach{ $0.removeFromSuperview() }
        
        var x: CGFloat = 16
        let width = UIScreen.main.bounds.width / 6
        lsDocTree.forEach {
            let btn = UIButton()
            btn.setTitle($0.data?.groupName, for: .normal)
            btn.tag = $0.data?.idDocumentTree ?? 0
            btn.setTitleColor(.lightGray, for: .normal)
            btn.addTarget(self, action: #selector(btnCate_Touched(_:)), for: .touchUpInside)
            
            btn.sizeToFit()
            btn.frame.size = CGSize(width: max(btn.frame.width, width), height: scvCate.frame.height)
            btn.frame.origin = CGPoint(x: x, y: 0)
            scvCate.addSubview(btn)
            lsButton.append(btn)
            x += btn.frame.width + 16
        }
        
        scvCate.contentSize.width = x
        
        lsButton.first?.sendActions(for: .touchUpInside)
    }
    
    @IBAction func btnCate_Touched(_ sender: UIButton){
        
        lsButton.forEach {
            $0.setTitleColor(.lightGray, for: .normal)
            $0.isSelected = false
        }
        
        sender.isSelected = true
        sender.setTitleColor(UIColor.systemBlue , for: .normal)
        title = sender.titleLabel?.text
        parent?.title = sender.titleLabel?.text
    }
    
    @IBAction func btnCamera_Touched(_ sender: UIButton) {
        documentScannerVCtrl.capturePhoto()
    }
    
    @IBAction func btnGallery_Touched(_ sender: UIButton) {
        result?(lsResult.map({$0.convertToString}))
        navigationController?.popToRootViewController(animated: true)
    }
}

struct ImageResult: Codable {
    var idDocumentTree: Int?
    var imgPath: String?
}

extension Encodable {
    var convertToString: String? {
        let jsonEncoder = JSONEncoder()
        jsonEncoder.outputFormatting = .prettyPrinted
        do {
            let jsonData = try jsonEncoder.encode(self)
            return String(data: jsonData, encoding: .utf8)
        } catch {
            return nil
        }
    }
}
