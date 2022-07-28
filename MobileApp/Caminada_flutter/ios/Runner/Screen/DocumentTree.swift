//
//  DocumentTree.swift
//  Runner
//
//  Created by I on 6/24/20.
//  Copyright © 2020 The Chromium Authors. All rights reserved.
//

import Foundation

class DocumentTree: Codable {
    var children: DocumentTreeData?
    var data: DocumentTreeData?
}

class DocumentTreeData: Codable {
    var idDocumentTree: Int?
    var idDocumentTreeParent: Int?
    var groupName: String?
}
