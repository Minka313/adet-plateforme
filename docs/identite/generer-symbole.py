def star(cx,cy,rx,ry,k=0.26):
    kx,ky=rx*k,ry*k
    return (f"M{cx},{cy-ry} C{cx+kx*0.3},{cy-ky} {cx+kx},{cy-ky*0.3} {cx+rx},{cy} "
            f"C{cx+kx},{cy+ky*0.3} {cx+kx*0.3},{cy+ky} {cx},{cy+ry} "
            f"C{cx-kx*0.3},{cy+ky} {cx-kx},{cy+ky*0.3} {cx-rx},{cy} "
            f"C{cx-kx},{cy-ky*0.3} {cx-kx*0.3},{cy-ky} {cx},{cy-ry}Z")
green=("M790,462 C860,440 950,425 990,385 C1015,355 1030,310 1040,262 "
       "C1072,320 1084,400 1072,480 C1058,580 1000,700 878,808 "
       "C905,730 940,640 942,560 C944,515 930,480 900,468 C860,462 820,466 790,462Z")
blue=("M1098,236 C1108,230 1120,232 1126,244 C1155,330 1178,440 1170,535 "
      "L1262,463 C1240,560 1180,640 1100,700 C1040,745 960,785 880,810 "
      "C980,750 1060,680 1105,590 C1135,520 1140,420 1098,236Z")
def svg(full=True):
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="770 20 500 800">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#00586E"/><stop offset=".35" stop-color="#007A10"/><stop offset=".75" stop-color="#3FA81C"/><stop offset=".9" stop-color="#5DBE2A"/><stop offset="1" stop-color="#1FC7C9"/></linearGradient>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A8DF2"/><stop offset="1" stop-color="#2E62EE"/></linearGradient>
<radialGradient id="h" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#1A4F8F"/><stop offset="1" stop-color="#00586E"/></radialGradient>
</defs>
<path d="{green}" fill="url(#g)"/>
<path d="{blue}" fill="url(#b)"/>
<circle cx="940" cy="330" r="52" fill="url(#h)"/>
<path d="{star(1055,88,65,70)}" fill="#F9DB5F"/>
<path d="{star(1185,66,27,30)}" fill="#F9DB5F"/>
<path d="{star(1150,157,40,45)}" fill="#F9DB5F"/>
<path d="{star(965,140,55,45)}" fill="#F9DB5F" opacity=".55"/>
<path d="{star(942,235,35,28)}" fill="#F9DB5F" opacity=".85"/>
<path d="{star(1100,212,78,48)}" fill="#FFAE5D"/>
</svg>'''
    return s
open('adet-symbole.svg','w').write(svg())
