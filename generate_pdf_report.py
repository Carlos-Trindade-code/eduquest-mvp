#!/usr/bin/env python3
"""
Gera relatório PDF de Benchmarking de Precificação para o Studdo.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib import colors
import os
from datetime import datetime

# ============================================================
# Colors
# ============================================================
PURPLE = HexColor('#7C3AED')
PURPLE_LIGHT = HexColor('#EDE9FE')
PURPLE_DARK = HexColor('#4C1D95')
BLUE = HexColor('#3B82F6')
BLUE_LIGHT = HexColor('#DBEAFE')
GREEN = HexColor('#10B981')
GREEN_LIGHT = HexColor('#D1FAE5')
AMBER = HexColor('#F59E0B')
AMBER_LIGHT = HexColor('#FEF3C7')
PINK = HexColor('#EC4899')
GRAY_100 = HexColor('#F3F4F6')
GRAY_200 = HexColor('#E5E7EB')
GRAY_500 = HexColor('#6B7280')
GRAY_700 = HexColor('#374151')
GRAY_900 = HexColor('#111827')
WHITE = white

OUTPUT_PATH = "/Users/carlostrindade/eduquest-mvp/Studdo_Benchmarking_Precificacao.pdf"

# ============================================================
# Styles
# ============================================================
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    name='CoverTitle',
    fontName='Helvetica-Bold',
    fontSize=32,
    leading=38,
    textColor=PURPLE_DARK,
    alignment=TA_CENTER,
    spaceAfter=12,
))

styles.add(ParagraphStyle(
    name='CoverSubtitle',
    fontName='Helvetica',
    fontSize=16,
    leading=22,
    textColor=GRAY_500,
    alignment=TA_CENTER,
    spaceAfter=6,
))

styles.add(ParagraphStyle(
    name='SectionTitle',
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=24,
    textColor=PURPLE_DARK,
    spaceBefore=24,
    spaceAfter=12,
))

styles.add(ParagraphStyle(
    name='SubSection',
    fontName='Helvetica-Bold',
    fontSize=14,
    leading=18,
    textColor=GRAY_900,
    spaceBefore=16,
    spaceAfter=8,
))

styles.add(ParagraphStyle(
    name='BodyText2',
    fontName='Helvetica',
    fontSize=10,
    leading=15,
    textColor=GRAY_700,
    alignment=TA_JUSTIFY,
    spaceAfter=8,
))

styles.add(ParagraphStyle(
    name='TableHeader',
    fontName='Helvetica-Bold',
    fontSize=9,
    leading=12,
    textColor=WHITE,
    alignment=TA_CENTER,
))

styles.add(ParagraphStyle(
    name='TableCell',
    fontName='Helvetica',
    fontSize=9,
    leading=12,
    textColor=GRAY_700,
    alignment=TA_CENTER,
))

styles.add(ParagraphStyle(
    name='TableCellLeft',
    fontName='Helvetica',
    fontSize=9,
    leading=12,
    textColor=GRAY_700,
    alignment=TA_LEFT,
))

styles.add(ParagraphStyle(
    name='TableCellBold',
    fontName='Helvetica-Bold',
    fontSize=9,
    leading=12,
    textColor=GRAY_900,
    alignment=TA_LEFT,
))

styles.add(ParagraphStyle(
    name='Highlight',
    fontName='Helvetica-Bold',
    fontSize=11,
    leading=15,
    textColor=PURPLE,
    spaceAfter=6,
))

styles.add(ParagraphStyle(
    name='BulletItem',
    fontName='Helvetica',
    fontSize=10,
    leading=15,
    textColor=GRAY_700,
    leftIndent=20,
    spaceAfter=4,
))

styles.add(ParagraphStyle(
    name='PlanTitle',
    fontName='Helvetica-Bold',
    fontSize=13,
    leading=17,
    textColor=PURPLE_DARK,
    spaceBefore=12,
    spaceAfter=4,
))

styles.add(ParagraphStyle(
    name='PlanPrice',
    fontName='Helvetica-Bold',
    fontSize=20,
    leading=26,
    textColor=PURPLE,
    spaceAfter=6,
))

styles.add(ParagraphStyle(
    name='FooterStyle',
    fontName='Helvetica',
    fontSize=8,
    leading=10,
    textColor=GRAY_500,
    alignment=TA_CENTER,
))


def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    header_row = [Paragraph(h, styles['TableHeader']) for h in headers]
    data = [header_row]
    for row in rows:
        data_row = []
        for i, cell in enumerate(row):
            if i == 0:
                data_row.append(Paragraph(str(cell), styles['TableCellBold']))
            else:
                data_row.append(Paragraph(str(cell), styles['TableCell']))
        data.append(data_row)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        # Body
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        # Alternating rows
        *[('BACKGROUND', (0, i), (-1, i), GRAY_100 if i % 2 == 0 else WHITE) for i in range(1, len(data))],
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ]))
    return t


def colored_box(text, bg_color, text_color=None):
    """Create a colored background paragraph (via table)."""
    if text_color is None:
        text_color = GRAY_900
    style = ParagraphStyle(
        'boxStyle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=text_color,
        alignment=TA_LEFT,
    )
    p = Paragraph(text, style)
    t = Table([[p]], colWidths=[17*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    return t


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )

    story = []
    page_width = A4[0] - 4*cm  # usable width

    # ============================================================
    # COVER PAGE
    # ============================================================
    story.append(Spacer(1, 4*cm))

    # Logo/Brand line
    story.append(Paragraph("STUDDO", ParagraphStyle(
        'brand', fontName='Helvetica-Bold', fontSize=14, leading=18,
        textColor=PURPLE, alignment=TA_CENTER, spaceAfter=20,
    )))

    story.append(HRFlowable(width="40%", thickness=2, color=PURPLE, spaceAfter=20))

    story.append(Paragraph(
        "Benchmarking de<br/>Precificacao",
        styles['CoverTitle']
    ))

    story.append(Paragraph(
        "Analise de Mercado EdTech e Estrategia de Pricing",
        styles['CoverSubtitle']
    ))

    story.append(Spacer(1, 1*cm))

    story.append(HRFlowable(width="30%", thickness=1, color=GRAY_200, spaceAfter=20))

    story.append(Paragraph(
        "Documento Confidencial",
        ParagraphStyle('conf', fontName='Helvetica-Bold', fontSize=10,
                       textColor=GRAY_500, alignment=TA_CENTER, spaceAfter=6)
    ))

    today = datetime.now().strftime("%d/%m/%Y")
    story.append(Paragraph(
        f"Preparado em {today}",
        ParagraphStyle('date', fontName='Helvetica', fontSize=10,
                       textColor=GRAY_500, alignment=TA_CENTER, spaceAfter=6)
    ))

    story.append(Paragraph(
        "Studdo - Tutor IA que ensina de verdade",
        ParagraphStyle('tagline', fontName='Helvetica-Oblique', fontSize=10,
                       textColor=PURPLE, alignment=TA_CENTER)
    ))

    story.append(PageBreak())

    # ============================================================
    # TABLE OF CONTENTS
    # ============================================================
    story.append(Paragraph("Sumario", styles['SectionTitle']))
    story.append(Spacer(1, 6))

    toc_items = [
        "1. Resumo Executivo",
        "2. Concorrentes Internacionais",
        "3. Concorrentes Brasileiros",
        "4. Analise Comparativa",
        "5. Estrategia de Precificacao Recomendada",
        "6. Detalhamento dos Planos",
        "7. Analise Competitiva",
        "8. Projecao de Receita",
        "9. Proximos Passos",
    ]
    for item in toc_items:
        story.append(Paragraph(item, ParagraphStyle(
            'tocItem', fontName='Helvetica', fontSize=11, leading=20,
            textColor=GRAY_700, leftIndent=10,
        )))

    story.append(PageBreak())

    # ============================================================
    # 1. RESUMO EXECUTIVO
    # ============================================================
    story.append(Paragraph("1. Resumo Executivo", styles['SectionTitle']))

    story.append(Paragraph(
        "Este documento apresenta uma analise completa do mercado de EdTech (tecnologia educacional) "
        "focada em plataformas de tutoria com IA para criancas e adolescentes de 4 a 18 anos. "
        "O objetivo e definir a estrategia de precificacao ideal para o Studdo, considerando "
        "concorrentes nacionais e internacionais, disposicao de pagamento do mercado brasileiro "
        "e o posicionamento unico da plataforma.",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 8))

    story.append(colored_box(
        "Recomendacao: R$ 19,90/mes (Plano Pro) e R$ 29,90/mes (Plano Familia) "
        "com free tier generoso para aquisicao.",
        PURPLE_LIGHT, PURPLE_DARK
    ))

    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "Principais conclusoes da pesquisa:",
        styles['Highlight']
    ))

    bullets = [
        "O concorrente mais proximo (Khanmigo) cobra ~R$21/mes pelo tutor socratico com IA",
        "No Brasil, 60% das EdTechs oferecem free tier - e essencial para aquisicao de usuarios",
        "O preco de R$19,90 ja foi validado no mercado brasileiro pelo Me Salva!",
        "Nenhuma EdTech brasileira oferece plano familia - diferencial competitivo forte",
        "O Studdo e 30-50x mais barato que tutoria presencial (Kumon: R$630-1.050/mes)",
    ]
    for b in bullets:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles['BulletItem']))

    story.append(PageBreak())

    # ============================================================
    # 2. CONCORRENTES INTERNACIONAIS
    # ============================================================
    story.append(Paragraph("2. Concorrentes Internacionais", styles['SectionTitle']))

    story.append(Paragraph(
        "Analise das principais plataformas globais de EdTech com foco em tutoria IA, "
        "gamificacao e acompanhamento de pais.",
        styles['BodyText2']
    ))

    intl_headers = ["Plataforma", "Modelo", "Preco Mensal", "Free Tier", "Publico"]
    intl_rows = [
        ["Khanmigo\n(Khan Academy)", "Assinatura", "~R$21/mes\n($4 USD)", "Khan Academy\ngratis, IA paga", "K-12"],
        ["Photomath\nPlus", "Freemium", "~R$52/mes\n($9.99 USD)", "OCR gratis,\nexplicacoes pagas", "Ens. Medio"],
        ["Duolingo\nSuper", "Freemium", "~R$50/mes", "Sim,\ncom anuncios", "Idiomas"],
        ["Quizlet\nPlus", "Freemium", "~R$44/mes\n($7.99 USD)", "Flashcards\ngratis", "Universitario+"],
        ["Brainly\nPlus", "Freemium", "~R$50/mes", "Respostas\nlimitadas", "K-12"],
        ["IXL", "Assinatura", "$9.95-19.95\n/mes", "Nao", "K-12"],
        ["Byju's", "Assinatura", "~R$150-300\n/mes", "Trial gratis", "K-12"],
        ["Kumon\n(presencial)", "Mensalidade", "R$630-1.050\n/mes", "Nao", "K-12"],
    ]

    story.append(make_table(intl_headers, intl_rows,
                            col_widths=[3.2*cm, 2.5*cm, 3*cm, 3*cm, 2.3*cm]))

    story.append(Spacer(1, 10))

    story.append(Paragraph("Destaques:", styles['SubSection']))

    intl_highlights = [
        "<b>Khanmigo</b> e o concorrente mais direto - usa metodo socratico com IA, "
        "porem nao tem gamificacao nem dashboard de pais com o nivel do Studdo.",
        "<b>Kumon</b> cobra R$630-1.050/mes por materia (presencial), mostrando que pais "
        "investem significativamente em educacao - o Studdo oferece mais por uma fracao do preco.",
        "<b>Duolingo</b> e referencia em gamificacao com modelo freemium - sua abordagem "
        "de XP, streaks e badges e similar ao Studdo.",
    ]
    for h in intl_highlights:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {h}", styles['BulletItem']))

    story.append(PageBreak())

    # ============================================================
    # 3. CONCORRENTES BRASILEIROS
    # ============================================================
    story.append(Paragraph("3. Concorrentes Brasileiros", styles['SectionTitle']))

    story.append(Paragraph(
        "Analise das principais plataformas EdTech do mercado brasileiro, "
        "com foco em pricing e posicionamento.",
        styles['BodyText2']
    ))

    br_headers = ["Plataforma", "Modelo", "Preco Mensal", "Free Tier", "Publico"]
    br_rows = [
        ["Descomplica", "Assinatura", "R$15-35/mes", "Conteudo\nlimitado", "Vestibular"],
        ["Me Salva!", "Assinatura", "R$19,90/mes\n(entrada)", "Videos\nlimitados", "Ens. Medio"],
        ["Stoodi", "Assinatura", "R$15-25/mes", "Trial", "Vestibular"],
        ["Kuadro", "Assinatura", "R$200-400/mes", "Nao", "Vestibular"],
    ]

    story.append(make_table(br_headers, br_rows,
                            col_widths=[3.2*cm, 2.5*cm, 3*cm, 3*cm, 2.3*cm]))

    story.append(Spacer(1, 10))

    story.append(colored_box(
        "Insight: O preco de entrada de R$19,90/mes ja foi validado pelo Me Salva! "
        "no mercado brasileiro - ponto de preco estrategico.",
        BLUE_LIGHT, HexColor('#1E40AF')
    ))

    story.append(Spacer(1, 8))

    story.append(Paragraph("Observacoes sobre o mercado brasileiro:", styles['SubSection']))

    br_notes = [
        "A maioria das plataformas brasileiras foca em vestibular/ENEM (publico 15-18 anos)",
        "Nao existe competidor direto para faixa 4-14 anos com tutor IA no Brasil",
        "O mercado brasileiro espera free tier como baseline",
        "Nenhuma plataforma oferece plano familia com multiplas criancas",
        "Gamificacao no nivel do Studdo (XP, badges, streaks) nao e comum no Brasil",
    ]
    for n in br_notes:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {n}", styles['BulletItem']))

    story.append(PageBreak())

    # ============================================================
    # 4. ANALISE COMPARATIVA
    # ============================================================
    story.append(Paragraph("4. Analise Comparativa", styles['SectionTitle']))

    story.append(Paragraph(
        "Comparacao de funcionalidades entre o Studdo e seus principais concorrentes.",
        styles['BodyText2']
    ))

    comp_headers = ["Funcionalidade", "Studdo", "Khanmigo", "Photomath", "Duolingo"]
    comp_rows = [
        ["Metodo Socratico", "Sim", "Sim", "Nao", "Nao"],
        ["IA Conversacional", "Sim", "Sim", "Parcial", "Parcial"],
        ["Gamificacao\n(XP, Badges)", "Completa", "Basica", "Nao", "Completa"],
        ["Dashboard Pais", "Completo", "Basico", "Nao", "Nao"],
        ["OCR de Tarefas", "Sim", "Nao", "Sim", "Nao"],
        ["5 Faixas Etarias", "Sim", "Sim", "Nao", "Nao"],
        ["Repeticao Espacada", "Sim (SM-2)", "Nao", "Nao", "Sim"],
        ["Plano Familia", "Sim", "Nao", "Nao", "Sim"],
        ["Pomodoro\nIntegrado", "Sim", "Nao", "Nao", "Nao"],
        ["Upload PDF/DOCX", "Sim", "Nao", "Nao", "Nao"],
    ]

    story.append(make_table(comp_headers, comp_rows,
                            col_widths=[3.5*cm, 2.8*cm, 2.8*cm, 2.8*cm, 2.8*cm]))

    story.append(Spacer(1, 10))

    story.append(colored_box(
        "O Studdo e a unica plataforma que combina: metodo socratico + gamificacao completa "
        "+ dashboard de pais + OCR + repeticao espacada + plano familia.",
        GREEN_LIGHT, HexColor('#065F46')
    ))

    story.append(PageBreak())

    # ============================================================
    # 5. ESTRATEGIA DE PRECIFICACAO
    # ============================================================
    story.append(Paragraph("5. Estrategia de Precificacao Recomendada", styles['SectionTitle']))

    story.append(Paragraph(
        "Com base na analise de mercado, recomendamos um modelo freemium com tres planos:",
        styles['BodyText2']
    ))

    story.append(Spacer(1, 10))

    # Pricing table
    pricing_headers = ["", "Gratis", "Pro", "Familia"]
    pricing_rows = [
        ["Preco Mensal", "R$ 0", "R$ 19,90", "R$ 29,90"],
        ["Preco Anual\n(por mes)", "R$ 0", "R$ 14,90", "R$ 22,90"],
        ["Sessoes/dia", "3", "Ilimitadas", "Ilimitadas"],
        ["Materias", "1", "Todas (7+)", "Todas (7+)"],
        ["OCR de Tarefas", "5/dia", "Ilimitado", "Ilimitado"],
        ["Upload PDF/DOCX", "Nao", "Sim", "Sim"],
        ["Dashboard Pais", "Basico", "Completo", "Completo"],
        ["Pomodoro", "Nao", "Sim", "Sim"],
        ["Relatorios Email", "Nao", "Semanal", "Semanal"],
        ["Criancas", "1", "1", "Ate 4"],
        ["Suporte", "Comunidade", "Email", "Prioritario"],
    ]

    # Create colored pricing table
    price_data = [[Paragraph(h, styles['TableHeader']) for h in pricing_headers]]
    for row in pricing_rows:
        price_data.append([
            Paragraph(row[0], styles['TableCellBold']),
            Paragraph(row[1], styles['TableCell']),
            Paragraph(row[2], styles['TableCell']),
            Paragraph(row[3], styles['TableCell']),
        ])

    price_table = Table(price_data, colWidths=[4.5*cm, 3.2*cm, 3.2*cm, 3.2*cm], repeatRows=1)
    price_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        # Column highlights
        ('BACKGROUND', (2, 1), (2, -1), HexColor('#F5F3FF')),  # Pro column highlight
        ('BACKGROUND', (3, 1), (3, -1), HexColor('#FDF4FF')),  # Family column highlight
        # Body
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(price_table)

    story.append(PageBreak())

    # ============================================================
    # 6. DETALHAMENTO DOS PLANOS
    # ============================================================
    story.append(Paragraph("6. Detalhamento dos Planos", styles['SectionTitle']))

    # Free Plan
    story.append(Paragraph("Plano Gratis (Essencial)", styles['PlanTitle']))
    story.append(Paragraph("R$ 0/mes", styles['PlanPrice']))
    story.append(Paragraph(
        "Objetivo: Aquisicao de usuarios e viralidade. Permite experimentar o Studdo "
        "com limitacoes que incentivam o upgrade.",
        styles['BodyText2']
    ))
    free_features = [
        "3 sessoes/dia com o tutor IA",
        "1 materia disponivel",
        "XP e badges basicos",
        "OCR de tarefas (5 por dia)",
        "Gamificacao basica (streaks e XP)",
    ]
    for f in free_features:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {f}", styles['BulletItem']))

    story.append(Spacer(1, 12))

    # Pro Plan
    story.append(Paragraph("Plano Pro", styles['PlanTitle']))
    story.append(Paragraph("R$ 19,90/mes ou R$ 14,90/mes (anual)", styles['PlanPrice']))
    story.append(Paragraph(
        "Objetivo: Principal fonte de receita. Acesso completo para familias com um filho. "
        "Preco validado pelo mercado brasileiro.",
        styles['BodyText2']
    ))
    pro_features = [
        "Sessoes ilimitadas com tutor IA",
        "Todas as materias (7+)",
        "Dashboard completo para pais",
        "Timer Pomodoro integrado",
        "OCR ilimitado + upload de PDF/DOCX",
        "Relatorios semanais por email",
        "Repeticao espacada (SM-2)",
        "Gamificacao completa",
    ]
    for f in pro_features:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {f}", styles['BulletItem']))

    story.append(Spacer(1, 12))

    # Family Plan
    story.append(Paragraph("Plano Familia", styles['PlanTitle']))
    story.append(Paragraph("R$ 29,90/mes ou R$ 22,90/mes (anual)", styles['PlanPrice']))
    story.append(Paragraph(
        "Objetivo: Maximizar LTV com familias de multiplos filhos. Diferencial unico "
        "no mercado brasileiro.",
        styles['BodyText2']
    ))
    family_features = [
        "Tudo do Plano Pro",
        "Ate 4 filhos conectados",
        "Dashboard unificado para pais",
        "Alertas inteligentes por filho",
        "Suporte prioritario",
        "Comparativo de progresso entre filhos",
    ]
    for f in family_features:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {f}", styles['BulletItem']))

    story.append(PageBreak())

    # ============================================================
    # 7. ANALISE COMPETITIVA
    # ============================================================
    story.append(Paragraph("7. Analise Competitiva de Precos", styles['SectionTitle']))

    story.append(Paragraph(
        "Posicionamento do Studdo em relacao aos concorrentes diretos:",
        styles['BodyText2']
    ))

    comp_price_headers = ["Comparacao", "Preco Concorrente", "Preco Studdo", "Vantagem Studdo"]
    comp_price_rows = [
        ["vs Khanmigo", "~R$21/mes", "R$19,90/mes", "Gamificacao +\nDashboard pais"],
        ["vs Photomath", "~R$52/mes", "R$19,90/mes", "62% mais barato +\nmetodo socratico"],
        ["vs Kumon", "R$630-1.050/mes", "R$19,90/mes", "30-50x mais barato\n+ IA 24/7"],
        ["vs Duolingo", "~R$50/mes", "R$19,90/mes", "60% mais barato +\ntutoria personalizada"],
        ["vs Byju's", "~R$150-300/mes", "R$19,90/mes", "7-15x mais barato\n+ plano familia"],
    ]

    story.append(make_table(comp_price_headers, comp_price_rows,
                            col_widths=[3*cm, 3.2*cm, 3*cm, 4.5*cm]))

    story.append(Spacer(1, 12))

    story.append(colored_box(
        "Posicionamento: Studdo se posiciona como a opcao com melhor custo-beneficio, "
        "oferecendo mais funcionalidades que o Khanmigo pelo mesmo preco, "
        "e sendo dezenas de vezes mais barato que tutoria presencial.",
        AMBER_LIGHT, HexColor('#92400E')
    ))

    story.append(Spacer(1, 16))

    # ============================================================
    # 8. PROJECAO DE RECEITA
    # ============================================================
    story.append(Paragraph("8. Projecao de Receita (Cenario Conservador)", styles['SectionTitle']))

    rev_headers = ["Metrica", "Mes 3", "Mes 6", "Mes 12", "Mes 24"]
    rev_rows = [
        ["Usuarios totais", "1.500", "5.000", "20.000", "80.000"],
        ["Conversao free > pago", "3%", "5%", "7%", "10%"],
        ["Assinantes pagos", "45", "250", "1.400", "8.000"],
        ["Ticket medio", "R$20", "R$22", "R$22", "R$24"],
        ["MRR (Receita Mensal)", "R$900", "R$5.500", "R$30.800", "R$192.000"],
        ["ARR (Receita Anual)", "R$10.800", "R$66.000", "R$369.600", "R$2.304.000"],
    ]

    story.append(make_table(rev_headers, rev_rows,
                            col_widths=[3.5*cm, 2.5*cm, 2.5*cm, 2.7*cm, 2.7*cm]))

    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "<b>Premissas:</b> Crescimento organico + indicacoes. Taxa de churn de 8% no mensal "
        "e 3% no anual. Ticket medio sobe conforme mais usuarios migram para plano familia. "
        "Nao considera receita de planos institucionais (escolas).",
        styles['BodyText2']
    ))

    story.append(PageBreak())

    # ============================================================
    # 9. PROXIMOS PASSOS
    # ============================================================
    story.append(Paragraph("9. Proximos Passos", styles['SectionTitle']))

    story.append(Paragraph(
        "Acoes recomendadas para implementacao da estrategia de precificacao:",
        styles['BodyText2']
    ))

    steps_data = [
        ("Curto Prazo (1-2 semanas)", [
            "Integrar Stripe para pagamentos (checkout, portal do cliente, webhooks)",
            "Criar pagina de pricing na landing page",
            "Implementar limites no free tier (sessoes/dia, materias)",
            "Configurar trial de 7 dias do Plano Pro para novos cadastros",
        ]),
        ("Medio Prazo (1-2 meses)", [
            "Implementar plano familia com dashboard unificado",
            "Criar sistema de relatorios semanais por email para pais",
            "Desenvolver cupons de desconto para campanhas",
            "Testar pricing com A/B test (R$14,90 vs R$19,90 vs R$24,90)",
        ]),
        ("Longo Prazo (3-6 meses)", [
            "Desenvolver plano institucional para escolas",
            "Implementar programa de indicacao (referral) com descontos",
            "Explorar parcerias com redes de escolas particulares",
            "Avaliar expansao para outros mercados LATAM",
        ]),
    ]

    for title, items in steps_data:
        story.append(Paragraph(title, styles['SubSection']))
        for item in items:
            story.append(Paragraph(f"<bullet>&bull;</bullet> {item}", styles['BulletItem']))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 16))

    # Final box
    story.append(colored_box(
        "Conclusao: A estrategia de R$19,90/mes (Pro) e R$29,90/mes (Familia) posiciona "
        "o Studdo de forma competitiva no mercado brasileiro, com um free tier generoso "
        "para aquisicao e um plano familia como diferencial unico. O potencial de receita "
        "em 24 meses e de R$2.3M ARR no cenario conservador.",
        PURPLE_LIGHT, PURPLE_DARK
    ))

    # ============================================================
    # BUILD
    # ============================================================
    doc.build(story)
    print(f"PDF gerado com sucesso: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_pdf()
