===========================================
হিসাব অ্যাপ — GitHub Pages ডিপ্লয় গাইড (আপডেটেড ও চেক করা)
===========================================

এই zip-এ যা যা আছে (সব ঠিকঠাক আছে, সরাসরি আপলোড করা যাবে):
--------------------------------------------------------------
index.html                          -> Expense Tracker (মূল অ্যাপ)
bazar-hisab.html                    -> বাজার হিসাব (আলাদা ফাইল, index.html এর ভেতর iframe দিয়ে খোলে)

manifest.json                       -> Expense Tracker এর manifest
sw.js                                -> Expense Tracker এর service worker
icon-192.png, icon-512.png          -> Expense Tracker এর আইকন (root এ)

bazar-manifest.json                 -> বাজার হিসাব এর manifest
bazar-sw.js                         -> বাজার হিসাব এর service worker
bazar-icons/                        -> বাজার হিসাব এর সব আইকন এখানে:
   - icon-192.png
   - icon-512.png
   - icon-512-maskable.png
   - apple-touch-icon.png
   - favicon-32.png

GitHub Pages এ বসানোর ধাপ:
----------------------------
1. GitHub এ রিপো বানাও (বা আগেরটাই ব্যবহার করো)।
2. এই zip এর ভেতরের সবকিছু (ফোল্ডার স্ট্রাকচার সহ, bazar-icons/ ফোল্ডারটাও) রিপোর root এ আপলোড করো।
3. Settings -> Pages -> Source: main branch, / (root) সিলেক্ট করে Save করো।
4. এক-দুই মিনিট পর লিংক পাবে: https://username.github.io/repo-name/
5. লিংক খুললেই index.html (Expense Tracker) খুলবে। বটম বারে "🧺 বাজার হিসাব" ট্যাব
   ক্লিক করলে বাজার হিসাব অ্যাপ খুলবে, টপ বার ও বটম বার সবসময় দেখা যাবে।
6. ফোনে লিংক খুলে "Add to Home Screen" করলে আইকন হয়ে বসে যাবে।

------------------------------------------------
আগেরবার তুমি যে ফাইল পাঠিয়েছিলে, তাতে যা ভুল ছিল (এবার ঠিক করে দেওয়া হয়েছে):
------------------------------------------------
1. bazar-manifest.json এর ভেতরে icon path গুলো লেখা ছিল "icons/icon-192.png" ইত্যাদি —
   কিন্তু bazar-hisab.html তার নিজের favicon/apple-touch-icon খুঁজছিল "bazar-icons/" ফোল্ডার থেকে।
   দুই জায়গায় দুই রকম ফোল্ডার নাম থাকায় আইকন লোড হতো না। এখন দুই জায়গাতেই "bazar-icons/" ব্যবহার
   করা হয়েছে, সামঞ্জস্যপূর্ণ করে দেওয়া হয়েছে।

2. bazar-sw.js এর ভেতরে APP_SHELL লিস্টে এখনো পুরনো নাম ছিল ("./index.html", "./manifest.json",
   "./icons/...") — যেগুলো bazar-hisab.html এর জন্য ভুল (ওটার আসল নাম bazar-hisab.html,
   manifest bazar-manifest.json)। এতে অফলাইন ক্যাশিং ঠিকমতো কাজ করতো না। এখন ঠিক করে
   "./bazar-hisab.html", "./bazar-manifest.json", "./bazar-icons/..." করে দেওয়া হয়েছে।

3. তুমি সব আইকন ফাইল (apple-touch-icon.png, favicon-32.png, icon-192.png, icon-512.png,
   icon-512-maskable.png) root এ ফ্ল্যাটভাবে পাঠিয়েছিলে, কোনো ফোল্ডার ছাড়াই। এখন সেগুলোকে
   ঠিক জায়গায় সাজানো হয়েছে:
   - icon-192.png ও icon-512.png -> root এ থাকবে (Expense Tracker এর জন্য) + একই ফাইলের
     কপি bazar-icons/ ফোল্ডারেও রাখা হয়েছে (বাজার হিসাবের জন্যও লাগে)
   - apple-touch-icon.png, favicon-32.png, icon-512-maskable.png -> শুধু bazar-icons/
     ফোল্ডারে রাখা হয়েছে (এগুলো শুধু বাজার হিসাবেরই দরকার)

এখন সব ফাইলের ভেতরের path আর ফোল্ডার স্ট্রাকচার একে অপরের সাথে মিলে গেছে — এই zip টা
সরাসরি GitHub এ আপলোড করলেই দুটো অ্যাপই ঠিকভাবে ইনস্টলযোগ্য PWA হিসেবে কাজ করবে।
