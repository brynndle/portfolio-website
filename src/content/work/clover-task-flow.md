---
title: "Clover Task Flow"
blurb: "I was tasked with creating a seamless Perka checkout experience that would run on several versions of the Clover point of sale terminal. The solution needed to guide the clerk through the correct series of steps to validate a transaction…"
tags: ["Product Design"]
thumbnail: "/images/thumbnails/work/clover-task-flow.jpg"
hero: "/images/projects/clover-task-flow/clover-station.png"
source: "https://brynncaputo.com/clover-task-flow"
featured: false
order: 0
role: "UX/UI Design"
methods: "Stakeholder Interviews, Engineer Collaboration, Task Flow/Swimlanes, UI Design"
figures:
  - src: "/images/projects/clover-task-flow/image-asset.png"
    caption: "A task flow with an adaptive experience depending on whether or not the validator would have knowledge of the order total, inventory, etc."
  - src: "/images/projects/clover-task-flow/Mobile-Basic-Punch-1.png"
    caption: "Mobile UI, step one of the punch redemption flow."
  - src: "/images/projects/clover-task-flow/Mobile-Basic-Punch-2.png"
    caption: "Mobile UI, step two."
  - src: "/images/projects/clover-task-flow/Mobile-Basic-Punch-5.jpg"
    caption: "Mobile UI, step three."
  - src: "/images/projects/clover-task-flow/Mobile-Basic-Punch-6.jpg"
    caption: "Mobile UI, step four."
---
# Designing for the Unknown

I was tasked with creating a seamless Perka checkout experience that would run on several versions of the Clover point of sale terminal. The solution needed to guide the clerk through the correct series of steps to validate a transaction and apply any applicable discounts to the order.

## Problem

Perka's integration with the Clover platform needed to solve the problem accurately updating the amount a customer owes regardless of if the customer was paying cash or credit and also handle the different times that a user may choose to redeem a reward.

We did not know how much data our system would have to work with. We started with the “worst case scenario” where the clerk is using a non-clover device where we would have no access to data and the clerk would have to do everything manually. That is, redeem a customers reward and manually apply the discount on their register to update the total of the till.

By gradually adding in features, we fleshed out several task flows that would cover most combinations of access we might have depending on the hardware and final features of the point of sale operating system that was still under development.

The case below is when a customer is using a Clover terminal which gave us access to more data and eased responsibility for the clerk. Using swim lanes allowed us to plot the two possible paths for cash and credit against the customers interactions with the app, the verbal interactions between clerk and customer, and the clerks interactions with the point of sale terminal.
