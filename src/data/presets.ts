import { PresetItem } from '../types/analyzer';

export const PRESETS: PresetItem[] = [
  {
    id: 'code-python-concurrency',
    title: 'Python Async Worker & SQL Flaw',
    domain: 'code',
    iconName: 'Code2',
    description: 'Async task processor with SQL string formatting, race conditions, and unclosed connection leaks.',
    customPrompt: 'Focus on OWASP Top 10 security vulnerabilities, connection pooling, and asyncio best practices.',
    content: `import asyncio
import sqlite3

class OrderProcessor:
    def __init__(self, db_path="app.db"):
        self.db = sqlite3.connect(db_path) # Unpooled raw connection
        self.processing_orders = set()

    async def fetch_and_fulfill(self, user_id: str, promo_code: str):
        # Vulnerability: Direct SQL string injection
        cursor = self.db.cursor()
        query = f"SELECT id, amount, status FROM orders WHERE user_id = '{user_id}' AND promo = '{promo_code}'"
        cursor.execute(query)
        orders = cursor.fetchall()

        tasks = []
        for order in orders:
            order_id = order[0]
            # Race condition: Shared mutable set mutated without lock
            if order_id not in self.processing_orders:
                self.processing_orders.add(order_id)
                tasks.append(self._charge_gateway(order_id, order[1]))

        results = await asyncio.gather(*tasks) # No exception handling or timeout
        
        # Missing cursor.close() and db.close()
        return {"processed": len(results), "status": "success"}

    async def _charge_gateway(self, order_id, amount):
        await asyncio.sleep(0.5)
        print(f"Charged order {order_id} for \${amount}")
        return True`,
  },
  {
    id: 'prose-pitch-fallacies',
    title: 'Executive AI Pitch Deck Memo',
    domain: 'prose',
    iconName: 'FileText',
    description: 'High-stakes investor narrative loaded with cognitive bias, logical fallacies, and unsubstantiated claims.',
    customPrompt: 'Examine cognitive biases, rhetoric, claim-to-evidence ratio, and Flesch-Kincaid readability.',
    content: `Subject: Project Singularity: Why We Will Dominate Enterprise AI by Q4

To the Investment Committee:

It is an indisputable scientific consensus that companies not adopting our neural autonomous substrate will be entirely obsolete within eighteen months. Everyone on Wall Street agrees that generative cognition is a winner-take-all market, and because our founding team went to Stanford, our algorithmic moats are naturally unbreachable.

Our proprietary engine delivers an astonishing 99.8% customer satisfaction score across all benchmarked cohorts. Either your fund leads this $50M pre-Series B round today, or you will be forced to watch your portfolio decay into complete irrelevance alongside legacy incumbents.

Competitor X claims to have lower latency, but their CEO was recently criticized on Twitter for mismanagement, so their software is obviously defective. Our growth is exponential and will undeniably compound at 400% month-over-month indefinitely into 2028.

We request your binding term sheet by Friday 5:00 PM EST.`,
  },
  {
    id: 'legal-saas-agreement',
    title: 'Enterprise Vendor MSA Agreement',
    domain: 'legal',
    iconName: 'ShieldAlert',
    description: 'Vendor contract excerpt containing unlimited client indemnity, ambiguous auto-renewal, and IP assignment traps.',
    customPrompt: 'Audit for liability exposure caps, unilateral termination penalties, and hidden IP assignment clauses.',
    content: `SECTION 8. INDEMNIFICATION & LIABILITY
8.1 Indemnification by Customer. Customer shall defend, indemnify, and hold harmless Vendor, its officers, contractors, and affiliates from and against any and all claims, damages, liabilities, losses, costs, and expenses (including uncapped legal fees) arising out of or relating to Customer's use of the Service, regardless of whether Vendor was contributorily negligent or aware of potential risks.
8.2 Limitation of Liability. IN NO EVENT SHALL VENDOR BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, PUNITIVE, OR LOST PROFIT DAMAGES. VENDOR'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL BE STRICTLY LIMITED TO THE LESSER OF $100.00 USD OR THE FEES PAID BY CUSTOMER IN THE PRECEDING ONE (1) MONTH.

SECTION 12. TERM & AUTOMATIC RENEWAL
12.1 Renewal. This Agreement automatically renews for successive three (3) year terms unless Customer provides written notice via registered postal mail at least one hundred and eighty (180) days prior to the expiration of the then-current term.
12.2 Intellectual Property. Any feedback, custom integrations, code adaptations, or workflow schemas developed by Customer during the term shall irrevocably become the exclusive intellectual property of Vendor without compensation.`,
  },
  {
    id: 'data-saas-metrics',
    title: 'Q3 SaaS Growth & Retention Cohorts',
    domain: 'data',
    iconName: 'BarChart3',
    description: 'Quarterly financial metrics containing monthly recurring revenue, net retention, customer acquisition cost, and churn spikes.',
    customPrompt: 'Perform statistical audit, detect anomalous churn surges, compute LTV:CAC ratios, and identify growth bottlenecks.',
    content: `Month,MRR_USD,New_Customers,Churned_Customers,Churn_Rate_Pct,CAC_USD,ARPU_USD,Net_Retention_Pct
Jan,125000,48,6,2.1,1420,380,104
Feb,134500,52,5,1.9,1390,395,106
Mar,148200,61,8,2.4,1450,402,108
Apr,159000,58,7,2.2,1480,410,107
May,168400,50,9,2.6,1560,415,105
Jun,176200,44,14,3.8,1720,418,99
Jul,181000,39,22,5.6,1980,412,94
Aug,184500,35,28,7.1,2250,405,89
Sep,187000,31,34,8.4,2490,398,84`,
  },
  {
    id: 'web-landing-audit',
    title: 'SaaS Checkout Landing Page Copy',
    domain: 'web',
    iconName: 'Globe',
    description: 'Landing page markup and copy evaluated for conversion friction, SEO metadata, heading hierarchy, and CTA clarity.',
    customPrompt: 'Evaluate conversion rate optimization (CRO) friction, search engine indexing signals, and cognitive clarity.',
    content: `<!DOCTYPE html>
<html>
<head>
  <title>Home</title> <!-- Generic title, no primary keyword -->
  <!-- Missing meta description, missing og:image, missing canonical -->
</head>
<body>
  <div class="hero">
    <h5>WELCOME TO THE FUTURE OF SYNERGISTIC WORKFLOWS</h5>
    <h1 style="font-size: 14px;">Cloud Computing Solutions</h1> <!-- Weak H1 with tiny font -->
    <p>Our multifaceted omni-channel ecosystem provides hyper-converged scalable paradigmatic enablement for modern forward-thinking enterprise teams seeking to optimize operational leverage.</p>
    
    <button style="background: grey;">Submit</button> <!-- Low contrast, ambiguous action label -->
    <button style="background: red;">Cancel / Leave Now</button>
  </div>

  <div class="features">
    <h3>Why Us</h3>
    <ul>
      <li>Fast</li>
      <li>Good</li>
      <li>Reliable</li>
    </ul>
  </div>

  <div class="pricing">
    <p>Contact sales for a custom quote after 45-minute mandatory phone qualification.</p>
  </div>
</body>
</html>`,
  },
];
