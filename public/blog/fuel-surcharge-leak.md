---
id: 1
title: "The $500 Anomaly: Hidden Fuel Charges"
date: "Oct 12, 2023"
category: "Forensic Audit"
preview: "How a 0.5% variance in fuel surcharges compounded into a measurable loss over 12 months."
metric: "Recovered $500"
tagStyle: "bg-red-50 text-red-600 border-red-100"
iconType: "search"
iconColor: "text-red-500"
image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
---

# The Fuel Surcharge Leak

While analyzing credit card statements for a beta client, my anomaly detection script flagged a repeating decimal pattern in fuel transactions.

## The Pattern

Most fuel stations waive the 1% surcharge. However, one specific station chain was applying a "dynamic currency conversion" fee erroneously labeled as a surcharge.

**Result:** A quick dispute raised with the bank recovered the funds. Small leaks sink great ships.

