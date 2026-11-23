#!/usr/bin/env python3
"""Asistent local gratuit pentru promovarea voluntară a unui profil TikTok.
Nu se autentifică, nu colectează date automat și nu publică mesaje fără acord.
"""
import argparse
import csv
import datetime as dt
import json
import pathlib
import random

PROFILE = 'https://www.tiktok.com/@carmonela'
ROOT = pathlib.Path(__file__).resolve().parent
DATA = ROOT / 'carmonela_progres.csv'
IDEAS = [
    'Un video de prezentare: cine este Carmen și de ce merită urmărită.',
    'O întrebare pentru public: Din ce oraș ne urmăriți?',
    'Un moment amuzant din viața de zi cu zi, cu acordul persoanelor filmate.',
    'Un răspuns video la un comentariu interesant.',
    'Un clip scurt cu invitație la următorul LIVE, dacă este programat.',
    'O poveste personală autentică în 20 de secunde.',
    'Un clip cu trei lucruri care o fac pe Carmen să zâmbească.',
]

def plan():
    today = dt.date.today()
    index = today.toordinal() % len(IDEAS)
    idea = IDEAS[index]
    text = (f'Bună! Dacă îți plac poveștile și conversațiile autentice, '
            f'descoperă profilul lui Carmen: {PROFILE} ❤️')
    print(f'\nPLAN GRATUIT — {today:%d.%m.%Y}\n')
    print('Idee de conținut (de trimis lui Carmen, dacă dorește):', idea)
    print('\nMesaj pentru distribuire DOAR în comunități care permit promovarea:')
    print(text)
    print('\nPași: cere acordul, publică doar în locuri potrivite, nu trimite mesaje nesolicitate.')
    print('Programul nu publică singur și nu poate garanta urmăritori.')

def record(count):
    if count < 0:
        raise ValueError('Numărul nu poate fi negativ.')
    first = not DATA.exists()
    with DATA.open('a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if first:
            writer.writerow(['data', 'urmaritori'])
        writer.writerow([dt.date.today().isoformat(), count])
    print(f'Salvat: {count} urmăritori la {dt.date.today().isoformat()}')

def stats():
    if not DATA.exists():
        print('Nu există date. Folosește: python promovare_carmonela.py record 860')
        return
    with DATA.open(newline='', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))
    if not rows:
        print('Nu există înregistrări.')
        return
    a, b = rows[0], rows[-1]
    delta = int(b['urmaritori']) - int(a['urmaritori'])
    print(f"Prima înregistrare: {a['data']} — {a['urmaritori']}")
    print(f"Ultima înregistrare: {b['data']} — {b['urmaritori']}")
    print(f'Creștere netă: {delta:+d}')

def main():
    parser = argparse.ArgumentParser(description='Plan zilnic gratuit de promovare pentru @carmonela')
    sub = parser.add_subparsers(dest='command')
    sub.add_parser('plan', help='Afișează planul zilei')
    rec = sub.add_parser('record', help='Înregistrează manual numărul de urmăritori')
    rec.add_argument('count', type=int)
    sub.add_parser('stats', help='Afișează evoluția')
    args = parser.parse_args()
    if args.command in (None, 'plan'):
        plan()
    elif args.command == 'record':
        record(args.count)
    elif args.command == 'stats':
        stats()

if __name__ == '__main__':
    main()
