---
title: "Perka iOS App"
blurb: "The Perka iOS App (now Clover Rewards) allows customers an easy way to participate in multiple merchants loyalty programs without having multiple paper punch cards and key chain cards."
tags: ["Product Design"]
thumbnail: "/images/projects/perka-app/image-asset.png"
source: "https://brynncaputo.com/perka-app"
featured: false
order: 4
role: "UX/UI Design"
methods: "User Interviews, Wireframes, Task Flows, UI Design"
figures:
  - src: "/images/projects/perka-app/image-asset.png"
    caption: "Our first version. We had to backtrack from our original design due to lack of functionality on the backend. This was very much a temporary solution to get us out of the gate."
  - src: "/images/projects/perka-app/image-asset-1.png"
    caption: "Eventually we were able to get our merchant branding into the list view. The purple, blue, and orange accents show the users tier status at these locations."
  - src: "/images/projects/perka-app/MB_listView_IT4.png"
    caption: "Our current app version. Users favorite spots appear in the top portion of the app, geo sorted so the closest spot loads first."
  - src: "/images/projects/perka-app/perka-helper.jpg"
    caption: "Enrollment code flow — customer-facing screen."
  - src: "/images/projects/perka-app/image-asset-2.png"
    caption: "Enrollment code flow — merchant-facing screen."
  - src: "/images/projects/perka-app/image-asset-3.png"
    caption: "iOS location permission onboarding screen."
  - src: "/images/projects/perka-app/image-asset-4.png"
    caption: "Android location permission recovery screen."
---
# Loyalty Made Easy

The Perka iOS App (now Clover Rewards) allows customers an easy way to participate in multiple merchants loyalty programs without having multiple paper punch cards and key chain cards.

My first project at Perka was redesigning the iOS App. This was in the middle of a complete relaunch of the product and all of the code and design was being rebuilt from the ground up. This put major constraints on what information I had to work with. The figures below show three iterations of the app from initial design to its current form.

## Goals

Design & launch a minimum viable product.

Work with the development team to gradually incorporate and test new features as they become technically feasible.

Track goals and use an iterative design process to improve app usability.

# Easing Customer Enrollment

## Goals

Design a flow that allows user accounts in various states of onboarding a consistent way to access the enrollment code feature.

Design a simple, intuitive UI for users to learn about and access the enrollment code feature.

In order to entice customers to sign up for Perka we created a feature where merchants could present customers with a scannable code that would give them loyalty points on the purchase they just completed even if they are not Perka members yet. Whenever a customer made an eligible purchase a QR code would print on a custom Perka receipt.

The figures below illustrate this process which was deceptively tricky. Perka allows customers to use our app without creating an account until we feel that we've presented them with value and, hopefully, have convinced them it's worth it. The flow deals with various states the user's account could be in when they are ready to scan their code.

View the implementation for the [Enrollment Code](http://www.theworkofdavidcaputo.com/#/perka-enrollment/) project.

# Orientation

## Goals

Design a quick and minimal onboarding flow that increased location-opt in conversions for both Android and iOS.

Our first time experience needed to get a few things from the customer and then get out of their way. We were very against using a "swipey tour" or illustrating all of the apps features right at the start. Before we were able to add search Perka required the users location so we could fetch nearby locations. We open with a soft ask explaining what we need and why. If the user is ok with this they are prompted with an iOS system dialog. If they are uncertain, we give them more information about why we need their location and when we’ll use it before prompting them. Because you can only ask a user for location once, we really needed the user to be primed and ready to accept it.

If the user decides not to grant us access we slide up an instruction screen telling them again why we require location and give them instructions on how to enable it. Everything in the preceding steps is aimed towards them not seeing this screen as it's a rather cumbersome process to enable location services once you have declined them.

Android deals with this differently than iOS. Permission is asked for location on app install. If the user installs the app and then disables location before opening it we again lock the app but this time a "Fix This" button takes them to the appropriate settings screen. If they have opened the app and we have a list cached we show them the merchants and also show a banner warning telling them that they really should enable location. Tapping the banner will take them to the settings screen.
