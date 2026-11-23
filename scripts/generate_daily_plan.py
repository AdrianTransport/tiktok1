#!/usr/bin/env python3
"""Create a deterministic daily organic content plan. No TikTok access or posting."""
import datetime as dt
import json
from pathlib import Path

IDEAS = [
    ("Cine este Carmen?", "Prezintă într-un clip scurt ce te pasionează și ce găsesc oamenii pe profil."),
    ("Întrebare pentru comunitate", "Întreabă publicul din ce oraș urmărește și răspunde comentariilor reale."),
    ("Poveste de 20 de secunde", "Spune o întâmplare autentică, cu un început care stârnește curiozitatea."),
    ("Pregătire LIVE", "Anunță un LIVE doar dacă titularul contului confirmă data și ora."),
    ("Trei lucruri preferate", "Filmează trei lucruri simple care îți fac ziua mai frumoasă."),
    ("Răspuns la comentariu", "Alege un comentariu real și pregătește un răspuns video."),
    ("Moment din culise", "Arată o activitate de zi cu zi fără a filma alte persoane fără acord."),
]
today = dt.datetime.now(dt.timezone.utc).date()
title, description = IDEAS[today.toordinal() % len(IDEAS)]
plan = {
    "date": today.isoformat(),
    "title": title,
    "description": description,
    "caption": "Descoperă @carmonela pe TikTok: https://www.tiktok.com/@carmonela ❤️",
    "note": "Plan pregătit automat. Publicarea și distribuirea necesită acordul și acțiunea titularului."
}
Path("plan-zilnic.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Generated plan for", today)
