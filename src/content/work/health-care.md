---
title: "Healthcare Efficiency"
blurb: "This company uses a new approach to healthcare with novel financial incentives. Their claims processing tools needed to be efficient enough to handle the growth of their user base."
thumbnail: "/images/projects/health-care/garner-process.png"
source: "https://brynncaputo.com/health-care"
featured: false
order: 2
role: "Senior Product Designer"
figures:
  - src: "/images/projects/health-care/garner-process.png"
    caption: "The claims record as it appears in the member app, showing status updates as a claim moves through processing."
---
# Healthcare Efficiency

Under a Non-Disclosure Agreement. Some of the details in this case study may be vague to protect the companies intellectual property.

This company uses a new approach to healthcare with novel financial incentives. Their claims processing tools needed to be efficient enough to handle the growth of their user base.

## Problems

### Adjudication Tool

To reimburse patients the company needs to intake, process, and adjudicate insurance claims. The tool they were using to process these claims was built without UX guidance and did not scale with the companies needs. It was slow, cumbersome to use, and did not reflect the current adjudication practices of their auditing team. I was brought on board to study their existing systems, analyze their auditors process and usage patterns, and redesign the tool from the ground up.

### Member App

Their member app contained the a bare minimum of features. I was responsible for building out their primary feature set that included providing visibility into the claims process, explanation of member benefits, payment options like direct deposit, and a clearer onboarding flow.

## Building an adjudication tool

I cannot show pictures of this interface due to the non-disclosure agreement.

I always have two goals when redesigning tools that are complex and require users to process high volumes of data. Create an intuitive steam lined system that is also a quality of life improvement for its users. Often these tools are used for tedious tasks by understaffed teams and keeping those teams happy and feeling heard can have a huge impact on productivity.

For this project I followed the following process that I have honed for over a decade in the industry:

Becoming a subject matter expert — To build a more efficient tool from the ground up I needed to be intimately familiar with insurance claim processing and adjudication. I met with the department head and specialists to learn the ins and outs of their jobs, their pain points, and what they thought could improve the experience. I also regularly shadowed adjudicators to learn about their unique idiosyncrasies.

Proof of concept in Retool — Even though Retool proved to be inadequate at a production level it was integral in rapidly prototyping a large array of concepts. I could design the interface and hand it off to developers who would quickly hook it up to our production data and allow our auditing team to perform robust testing.

Full redesign implemented in React — Once we had iterated and improved our prototype I translated the design into react components with Material as a base, creating custom components as needed.

The final design of the tool used several guided principles to ensure we were optimizing for efficiency while taking into account adjudicator quality of life.

Show the adjudicator as much information as possible — Usually I try to show exactly the data a user needs at the moments they need it and not overwhelm them with superfluous detail. In this case, our adjudicators were power users that were solving a myriad of complex issues. They needed an incredible amount of data and did not want to hunt for it on multiple tabs and pages. Their skillset allowed them easily parse information and they wanted as much of it front-and-center as possible. Tabs were only used to divide up large tables of data that would have otherwise caused the page length to be unmanageable.

Keep track of every decision — When solving claims issues it is helpful for adjudicators and claims processors to see what actions have previously been taken by other members of the team. Part of the claims team job was also providing information to members who had questions about their claims. Being able to easily report back to our customer service specialists helped minimize the impact of the requests on the adjudicator team.

## Improving the member app

### Payments

Like with most insurance companies, the number one concern for our users was 1. Knowing if their treatments are covered and 2. When are they getting reimbursed. Insurance claims can be complicated on their own. We wanted to make that as easy as possible for them by providing clarity into the claims process.

### The Timeline

Steps 1 and 2 we couldn’t offer any insight into. Visibility into the insurance process can be difficult. Once the insurance company processed a claim we checked to see if it met the plan requirements and paid it out. A record of the process appears in the patients app where they can get updates on its status.

### Payment Details

The app offers 2 ways for patients to receive their funds, by check or through direct deposit. There was an edge case that needed to be covered where patients could receive a payment by one method and then receive another patient by another method:

Patient has checks chosen as a reimbursement method.

A claim is partially paid due to some expenses being ineligible under their company policy.

The patient changes their reimbursement method to direct deposit (this was most likely during the roll out of the direct deposit feature).

The patient then disputes the partial approval and has the rest of their claim approved and paid through direct deposit.

Even though it was an unlikely case, we found that the engineering and design investment required to cover this case in the app was minimal (once implemented the cost to implement a fix like this could potentially be quite large) so we decided to implement a multi-card system to be able to handle this and future cases that might arise.

A note on totals: To further complicate this case it is possible for multiple claims to be reimbursed in a single transaction which would mean that the deposit total and the amount being reimbursed for a single claim could be different. That's why the amount on each card does not always match the check or deposit total.
