# Converting AILAR.UZ to Vercel

To connect your domain **ailar.uz** to your Vercel deployment, you need to update your DNS settings. You have two options:

---

## Option 1: Change Nameservers (Recommended)
This gives Vercel full control over your DNS, which is easier for SSL and automatic renewal.

**1. Log in to your Registrar**
Go to the admin panel where you bought the domain (likely **SUVAN NET** or **cctld.uz**).

**2. Find "Nameservers" or "DNS Servers" settings**
Replace your current nameservers (ahost.uz / ahost.cloud) with Vercel's:

| Nameserver |
| :--- |
| `ns1.vercel-dns.com` |
| `ns2.vercel-dns.com` |

**3. Wait for Propagation**
It can take up to 24-48 hours, but usually happens within minutes for .uz domains.

---

## Option 2: Keep Current DNS (A Record)
Use this if you want to keep your email or other services on **ahost.uz** but point the website to Vercel.

**1. Log in to your DNS Provider (Ahost)**
Go to the DNS Management section for `ailar.uz`.

**2. Add/Update these records:**

| Type | Name (Host) | Value |
| :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

---

## Final Step: Add Domain in Vercel
1. Go to your Vercel Dashboard.
2. Select your project ("ailar").
3. Go to **Settings** > **Domains**.
4. Enter `ailar.uz` and click **Add**.
5. Vercel will check the verification. Once the DNS updates propagate, it will turn **Green (Valid)**.
