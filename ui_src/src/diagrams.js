export const diagrams = {
    'actdiag':
`actdiag {
    write -> convert -> image

    lane user {
        label = "User"
        write [label = "Writing reST"];
        image [label = "Get diagram IMAGE"];
    }
    lane actdiag {
        convert [label = "Convert reST to Image"];
    }
}`,
    'blockdiag':
`blockdiag {
    A -> B;
    B -> C;
    B -> D;
    B -> Z;
    D -> E;
}`,
    'nwdiag':
`nwdiag {
    network dmz {
        address = "210.x.x.x/24"

        web01 [address = "210.x.x.1"];
        web02 [address = "210.x.x.2"];
    }
    network internal {
        address = "172.x.x.x/24";

        web01 [address = "172.x.x.1"];
        web02 [address = "172.x.x.2"];
        db01;
        db02;
    }
}`,
    'packetdiag':
`packetdiag {
    colwidth = 32
    node_height = 72

    0-15: Source Port
    16-31: Destination Port
    32-63: Sequence Number
    64-95: Acknowledgment Number
    96-99: Data Offset
    100-105: Reserved
    106: URG [rotate = 270]
    107: ACK [rotate = 270]
    108: PSH [rotate = 270]
    109: RST [rotate = 270]
    110: SYN [rotate = 270]
    111: FIN [rotate = 270]
    112-127: Window
    128-143: Checksum
    144-159: Urgent Pointer
    160-191: (Options and Padding)
    192-223: data [colheight = 3]
}`,
    'rackdiag':
`rackdiag {
    // define height of rack
    8U;

    // define rack items
    1: UPS [2U];
    3: DB Server
    4: Web Server
    5: Web Server
    6: Web Server
    7: Load Balancer
    8: L3 Switch
}`,
    'seqdiag':
`seqdiag {
    browser  -> webserver [label = "GET /index.html"];
    browser <-- webserver;
    browser  -> webserver [label = "POST /blog/comment"];
                webserver  -> database [label = "INSERT comment"];
                webserver <-- database;
    browser <-- webserver;
}`
}