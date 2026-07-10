"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, type Variants } from "framer-motion";
import {
  BookOpen,
  Shield,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

const resources = [
  {
    href: "/help",
    icon: HelpCircle,
    label: "Help Center",
    desc: "Find answers to common questions about Bloom — account setup, bookmarks, tracker, wallet, and more.",
    color: "bg-secondary/10 text-secondary border-secondary/20",
    iconBg: "bg-secondary/10 text-secondary",
  },
  {
    href: "/privacy",
    icon: Shield,
    label: "Privacy Policy",
    desc: "Understand how we collect, store, and protect your personal information on the Bloom platform.",
    color: "bg-success-surface text-success border-success/20",
    iconBg: "bg-success-surface text-success",
  },
  {
    href: "/terms",
    icon: FileText,
    label: "Terms of Use",
    desc: "Read the terms and conditions that govern your access to and use of the Bloom platform.",
    color: "bg-accent-gold-surface text-accent-gold border-accent-gold/20",
    iconBg: "bg-accent-gold-surface text-accent-gold",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background min-h-screen transition-colors duration-300">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border py-20 px-4 sm:px-6 lg:px-8">
          {/* Background blobs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-secondary/6 blur-3xl pointer-events-none" />

          <motion.div
            className="max-w-3xl mx-auto text-center relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4"
            >
              <Sparkles className="w-3.5 h-3.5" /> Resources
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight"
            >
              Everything You Need
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-base text-foreground-muted max-w-xl mx-auto leading-relaxed"
            >
              Guides, policies, and support resources to help you get the most out of Bloom — your women&apos;s opportunity platform.
            </motion.p>
          </motion.div>
        </section>

        {/* Resource Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {resources.map(({ href, icon: Icon, label, desc, color, iconBg }) => (
              <motion.div key={href} variants={itemVariants}>
                <Link href={href} className="group block h-full">
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={`h-full p-6 bg-surface border rounded-3xl shadow-sm transition-all ${color}`}
                  >
                    <div className={`inline-flex p-3 rounded-2xl mb-4 ${iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {label}
                    </h3>
                    <p className="text-xs text-foreground-muted leading-relaxed">{desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                      View {label}
                      <motion.span
                        className="inline-flex"
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Contact Section */}
        <section className="border-t border-border bg-surface-raised py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={itemVariants} className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-3">
                <MessageCircle className="w-3.5 h-3.5" /> Contact Us
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                Get in Touch
              </h2>
              <p className="text-sm text-foreground-muted mt-2 max-w-md mx-auto">
                Have a question or need help? Reach out to the Bloom team directly — we typically respond within 24 hours.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
            >
              {/* Phone */}
              <motion.a
                variants={itemVariants}
                href="tel:+918700113731"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-0.5">
                    Phone / WhatsApp
                  </p>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    +91 870 011 3731
                  </p>
                </div>
              </motion.a>

              {/* Email */}
              <motion.a
                variants={itemVariants}
                href="mailto:nikhil2005114@gmail.com"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-0.5">
                    Email Support
                  </p>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors break-all">
                    nikhil2005114@gmail.com
                  </p>
                </div>
              </motion.a>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
