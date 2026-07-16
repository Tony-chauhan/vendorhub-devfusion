import os
from fpdf import FPDF

# Color definitions (RGB)
BLUE = (46, 75, 198)       # #2E4BC6
LIGHT_BLUE = (238, 241, 251) # #EEF1FB
GREEN = (26, 122, 74)      # #1A7A4A
LIGHT_GREEN = (230, 244, 238) # #E6F4EE
WHITE = (255, 255, 255)
DARK = (26, 26, 46)        # #1A1A2E
GREY_BG = (245, 247, 255)   # #F5F7FF
VIOLET = (124, 58, 237)    # #7C3AED
GREY = (100, 100, 100)

class ScriptPDF(FPDF):
    def header(self):
        # We don't want header on the cover page
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(*GREY)
            self.cell(0, 8, "VendorHub - Video Submission Script", align="R", new_x="LMARGIN", new_y="NEXT")
            # Drawing thin separator line
            self.set_draw_color(*BLUE)
            self.set_line_width(0.5)
            self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
            self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*GREY)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

def create_script_pdf(output_path):
    pdf = ScriptPDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    
    # Page margins
    pdf.set_margins(15, 15, 15)
    
    # ── COVER PAGE ──
    pdf.add_page()
    
    # Top banner background block
    pdf.set_fill_color(*BLUE)
    pdf.rect(0, 0, 210, 80, "F")
    
    # White text for header
    pdf.set_y(25)
    pdf.set_font("Helvetica", "B", 26)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 10, "VENDORHUB", align="C", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Video Submission Script & Production Guide", align="C", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("Helvetica", "I", 11)
    pdf.cell(0, 8, "DevFusion 2.0 Hackathon | Team 8 Progress Showcase", align="C", new_x="LMARGIN", new_y="NEXT")
    
    # Move past the banner
    pdf.set_y(90)
    pdf.set_text_color(*DARK)
    
    # Document Metadata Block
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, "Video & Script Metadata", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*BLUE)
    pdf.set_line_width(1)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(4)
    
    # Metadata Table (clean ASCII-only values to prevent encoding errors)
    metadata = [
        ("Project Name:", "VendorHub (Hyperlocal Multi-Vendor E-Commerce Platform)"),
        ("Team Name:", "Team 8 - VH (TeamXdesign)"),
        ("Team Members:", "Dharmender Chauhan (Lead Architect) & Rishita Sorout (UI/UX Specialist)"),
        ("Target Duration:", "4 Minutes (240 Seconds)"),
        ("Video Theme:", "Technical walkthrough, clean transitions, slate glassmorphic UI focus"),
        ("Live URL:", "https://vendorhub-devfusion.vercel.app"),
        ("Repository:", "https://github.com/Tony-chauhan/vendorhub-devfusion"),
        ("Upcoming Focus:", "Testing and Quality Assurance (Vitest, Playwright, Accessibility Audits)"),
    ]
    
    pdf.set_font("Helvetica", "", 10)
    for label, val in metadata:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(40, 7, label, border=0)
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(140, 7, val, border=0, new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(10)
    
    # Executive Summary / Overview Box
    pdf.set_fill_color(*GREY_BG)
    pdf.set_draw_color(*BLUE)
    pdf.set_line_width(0.5)
    
    x = 15
    y = pdf.get_y()
    w = 180
    h = 45
    pdf.rect(x, y, w, h, "FD")
    
    pdf.set_xy(x + 5, y + 4)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*BLUE)
    pdf.cell(0, 6, "Script Executive Summary", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_x(x + 5)
    pdf.set_font("Helvetica", "", 9.5)
    pdf.set_text_color(*DARK)
    summary_text = (
        "This document details the complete video submission script for the VendorHub project audit. "
        "The script is structured into a professional multi-column production format containing visual cues, "
        "speech narration, and timecodes. It details the completed tasks (Phases 1 & 2), project status, "
        "and details the concrete testing and QA deliverables planned for the upcoming week."
    )
    pdf.multi_cell(170, 5, summary_text)
    
    # ── SCRIPT PAGE 2: SCRIPT START ──
    pdf.add_page()
    pdf.set_text_color(*DARK)
    
    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "1. Video Script & Storyboard (Two-Column Layout)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*BLUE)
    pdf.set_line_width(1)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)
    
    # Introduction Paragraph
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, "The following grid is split into time segments, screen/visual actions (left), and narration/audio text (right). Speaker instructions are indicated in brackets.", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    
    # Script Data for Table
    # Columns: Time, Visual Cues, Narration
    script_data = [
        (
            "0:00 - 0:35\n(35s)",
            "SHOW: The live VendorHub landing page.\n\nACTION: Slowly scroll down to show the modern glassmorphic design system. Hover mouse over search bar. Zoom in on the Gemini AI fuzzy search input.",
            "[Speaker: Dharmender]\n\n\"Hello judges and team! We are Team 8, and we're excited to present VendorHub - our premium, AI-powered hyperlocal multi-vendor marketplace built for the DevFusion 2.0 Hackathon.\n\nVendorHub connects local storefronts with neighborhood buyers seamlessly. Our main goal was to deliver a responsive, lightning-fast platform that bridges local business and digital convenience. Let's look at what we've built so far.\""
        ),
        (
            "0:35 - 1:20\n(45s)",
            "SHOW: Clerk sign-in page.\n\nACTION: Log in with a buyer account. Browse products, click on one, open the detail page, show adding to cart, and go to check out. Show ImageKit-optimized images.",
            "[Speaker: Rishita / Dharmender]\n\n\"Under the hood, VendorHub runs on Next.js 16, Neon Serverless PostgreSQL, and Prisma ORM.\n\nIn Phase 1, we implemented secure multi-tenant identity via Clerk, mapping roles to Buyers, Vendors, and Admins. We synced user profiles asynchronously using Inngest webhooks. Product images are uploaded client-side directly to ImageKit.io CDN for fast global delivery. Everything is styled with a premium slate-glassmorphic theme using Tailwind CSS.\""
        ),
        (
            "1:20 - 2:20\n(60s)",
            "SHOW: Checkout flow & Payment.\n\nACTION: Fill in address. Click 'Pay Online'. Show the real Razorpay payment window appearing. Trigger test payment. Visual: Canvas-confetti explosion on success!\n\nSHOW: Vendor orders list showing status update options.",
            "[Speaker: Dharmender]\n\n\"For Phase 2, we integrated a live Razorpay payment gateway with signature-verified webhooks for stock reservation and order processing.\n\nWe also built a wishlist with database persistence, a verified-purchase review system preventing duplicate ratings, and a vendor order management flow where vendors can update order status (Placed, Confirmed, Shipped, Delivered) and have it persist dynamically in the database.\""
        ),
        (
            "2:20 - 2:50\n(30s)",
            "SHOW: Terminal and Build logs.\n\nACTION: Show clean 'npm run build' output, showing zero errors. Show live deployment on Vercel.\n\nSHOW: Vendor dashboard analytics charts.",
            "[Speaker: Dharmender]\n\n\"As of today, the project's current status is highly stable. 100% of our core and Phase 2 roadmap tasks are complete. The codebase compiles with zero TypeScript errors. It builds successfully and is deployed live. During walkthrough testing, we resolved critical pre-existing issues like mock catalog disconnects and empty-cart redirect races, ensuring a seamless user flow.\""
        ),
        (
            "2:50 - 3:45\n(55s)",
            "SHOW: VS Code showing the 'src/__tests__' directory and Vitest configuration.\n\nACTION: Highlight a slide with the 4 pillars of the QA plan: Unit, E2E, Audits, Credentials.",
            "[Speaker: Rishita / Dharmender]\n\n\"Looking ahead to the upcoming week, our deliverables focus entirely on Testing and Quality Assurance to lock down stability. We'll write Vitest unit tests for server actions, auth guards, and db queries. We'll set up Playwright for E2E checkout walkthroughs. We will perform comprehensive accessibility, performance, and responsive audits. Finally, we'll verify our production API keys before launch.\""
        ),
        (
            "3:45 - 4:00\n(15s)",
            "SHOW: Thank you slide.\n\nACTION: Display GitHub repository link (github.com/Tony-chauhan/vendorhub-devfusion) and live URL (vendorhub-devfusion.vercel.app).",
            "[Speaker: Dharmender]\n\n\"We've created a fast, feature-rich hyperlocal platform. We invite you to check out our live app and review the code on GitHub. Thank you for your time and feedback!\""
        )
    ]
    
    # Table header
    pdf.set_fill_color(*BLUE)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 10)
    
    pdf.cell(24, 8, "Time", border=1, fill=True, align="C")
    pdf.cell(63, 8, "Visual Cues & Actions", border=1, fill=True, align="C")
    pdf.cell(93, 8, "Speech Narration & Audio Script", border=1, fill=True, align="C", new_x="LMARGIN", new_y="NEXT")
    
    # Alternating row colors
    fill = False
    
    for time, visuals, audio in script_data:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*DARK)
        
        # Calculate cell lines
        time_lines = len(pdf.multi_cell(24, 4.5, time, dry_run=True, output="LINES"))
        visual_lines = len(pdf.multi_cell(63, 4.5, visuals, dry_run=True, output="LINES"))
        audio_lines = len(pdf.multi_cell(93, 4.5, audio, dry_run=True, output="LINES"))
        
        max_lines = max(time_lines, visual_lines, audio_lines)
        row_height = max_lines * 4.5 + 4
        
        # Check page break
        if pdf.get_y() + row_height > 270:
            pdf.add_page()
            # Redraw header
            pdf.set_fill_color(*BLUE)
            pdf.set_text_color(*WHITE)
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(24, 8, "Time", border=1, fill=True, align="C")
            pdf.cell(63, 8, "Visual Cues & Actions", border=1, fill=True, align="C")
            pdf.cell(93, 8, "Speech Narration & Audio Script", border=1, fill=True, align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*DARK)
        
        # Background
        y_start = pdf.get_y()
        if fill:
            pdf.set_fill_color(*GREY_BG)
            pdf.rect(15, y_start, 180, row_height, "F")
        
        # Draw cells
        # Col 1: Time
        pdf.set_xy(15, y_start + 2)
        pdf.set_font("Helvetica", "B", 9)
        pdf.multi_cell(24, 4.5, time, border=0, align="C")
        
        # Col 2: Visuals
        pdf.set_xy(39, y_start + 2)
        pdf.set_font("Helvetica", "", 8.5)
        pdf.multi_cell(63, 4.5, visuals, border=0, align="L")
        
        # Col 3: Audio
        pdf.set_xy(102, y_start + 2)
        pdf.set_font("Helvetica", "", 8.5)
        pdf.multi_cell(93, 4.5, audio, border=0, align="L")
        
        # Draw outlines for cells
        pdf.set_draw_color(200, 200, 200)
        pdf.set_line_width(0.2)
        pdf.rect(15, y_start, 24, row_height)
        pdf.rect(39, y_start, 63, row_height)
        pdf.rect(102, y_start, 93, row_height)
        
        # Move to next line
        pdf.set_xy(15, y_start + row_height)
        fill = not fill
    
    # ── UPCOMING WEEK QA & TESTING PLAN ──
    pdf.add_page()
    pdf.set_text_color(*DARK)
    
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "2. Upcoming Week Plan: Testing & QA Deliverables", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*BLUE)
    pdf.set_line_width(1)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)
    
    # Deliverables intro
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, "To ensure that VendorHub is production-ready, highly reliable, and matches corporate standards, our focus for the upcoming week shifts entirely to Testing and Quality Assurance (QA). Below are the planned deliverables, strategies, and execution timelines.", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    
    # QA Pillars
    qa_pillars = [
        (
            "1. Unit & Integration Testing (Vitest)",
            "Scope: Core database operations, server actions, authentication route guards, and utility modules.\n"
            "Key Focus Areas:\n"
            "  * Server Actions: Test validations in product creations (CRUD), reviews creation (verified-purchase check, duplicate-block), and cart updates.\n"
            "  * Route Guards: Verify proxy.ts (middleware) successfully blocks unauthorized paths based on user roles (Admin vs. Vendor vs. Buyer).\n"
            "  * Database Transactions: Validate stock reservation integrity inside order actions under simulated concurrent purchases."
        ),
        (
            "2. End-to-End (E2E) Testing (Playwright)",
            "Scope: Full user journey simulation from landing page to successful checkout celebration.\n"
            "Key Focus Areas:\n"
            "  * Buyer Journey: Search -> Wishlist -> Add to Cart -> Checkout Form -> Razorpay overlay simulation -> Order Success Page & Confetti.\n"
            "  * Vendor Journey: Store Registration -> Product Inventory Management (CRUD) -> Order Status Updates.\n"
            "  * Edge Cases: Empty cart redirection handling, payment abandonment cleanup simulation, and network failures."
        ),
        (
            "3. Quality Assurance & Performance Audits",
            "Scope: User Experience (UX), Performance, Accessibility (a11y), and responsiveness across devices.\n"
            "Key Focus Areas:\n"
            "  * Accessibility (WCAG 2.1): Run automated axe-core audits to ensure proper contrast ratios, screen-reader support, and keyboard navigation.\n"
            "  * Performance Audits: Lighthouse runs to optimize ImageKit.io loader image dimensions, bundle sizes, and server response times.\n"
            "  * Responsive Integrity: Verify glassmorphic layouts render cleanly on mobile viewports (iOS/Android) and ultrawide desktops."
        ),
        (
            "4. API Keys & Sandbox Credentials Audit",
            "Scope: Secure environment variables validation and transition to official sandbox testing credentials.\n"
            "Key Focus Areas:\n"
            "  * Clerk Integration: Verify user synchronization webhook secret keys in neon-postgres.\n"
            "  * Razorpay Integration: Ensure test payment keys (rzp_test_...) function securely without public exposure.\n"
            "  * Gemini API Credentials: Verify dual-engine fallback logic activates smoothly when API quotas are exceeded."
        )
    ]
    
    for title, detail in qa_pillars:
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(*BLUE)
        pdf.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(0, 4.5, detail, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)
        
    # Testing Timeline Table
    pdf.ln(2)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Testing & QA Schedule", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_fill_color(*BLUE)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(30, 7, "Milestone", border=1, fill=True, align="C")
    pdf.cell(100, 7, "Tasks & Activities", border=1, fill=True, align="C")
    pdf.cell(50, 7, "Target Date", border=1, fill=True, align="C", new_x="LMARGIN", new_y="NEXT")
    
    schedule = [
        ("Milestone 1", "Configure Vitest environment & write unit tests for server actions", "Monday, July 13"),
        ("Milestone 2", "Write role-guard tests & database concurrency tests", "Tuesday, July 14"),
        ("Milestone 3", "Configure Playwright & script E2E checkout/order flows", "Wednesday, July 15"),
        ("Milestone 4", "Run axe-core accessibility checks & responsive layouts audits", "Thursday, July 16"),
        ("Milestone 5", "Complete Lighthouse optimization & credentials check; final QA review", "Friday, July 17"),
    ]
    
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(*DARK)
    fill = False
    for milestone, tasks, date in schedule:
        y_start = pdf.get_y()
        m_lines = len(pdf.multi_cell(30, 4, milestone, dry_run=True, output="LINES"))
        t_lines = len(pdf.multi_cell(100, 4, tasks, dry_run=True, output="LINES"))
        d_lines = len(pdf.multi_cell(50, 4, date, dry_run=True, output="LINES"))
        
        max_lines = max(m_lines, t_lines, d_lines)
        row_height = max_lines * 4 + 4
        
        if fill:
            pdf.set_fill_color(*GREY_BG)
            pdf.rect(15, y_start, 180, row_height, "F")
            
        pdf.set_xy(15, y_start + 2)
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.multi_cell(30, 4, milestone, border=0, align="C")
        
        pdf.set_xy(45, y_start + 2)
        pdf.set_font("Helvetica", "", 8.5)
        pdf.multi_cell(100, 4, tasks, border=0, align="L")
        
        pdf.set_xy(145, y_start + 2)
        pdf.multi_cell(50, 4, date, border=0, align="C")
        
        # draw grid lines
        pdf.set_draw_color(200, 200, 200)
        pdf.rect(15, y_start, 30, row_height)
        pdf.rect(45, y_start, 100, row_height)
        pdf.rect(145, y_start, 50, row_height)
        
        pdf.set_xy(15, y_start + row_height)
        fill = not fill
        
    # Sign-off Footer
    pdf.ln(8)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*BLUE)
    pdf.cell(0, 6, "Report & Plan Authorized By:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*DARK)
    pdf.cell(0, 5, "Dharmender Chauhan - Lead Architect & Developer  |  Rishita Sorout - UI/UX Designer & Developer", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 5, "Team 8 - VH (VendorHub)  |  Organisation: Enginow", new_x="LMARGIN", new_y="NEXT")
    
    # Save the file
    pdf.output(output_path)
    print(f"Video submission script PDF generated at: {output_path}")

if __name__ == "__main__":
    create_script_pdf("VendorHub_Video_Submission_Script.pdf")
