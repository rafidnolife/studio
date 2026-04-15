
# দোকান এক্সপ্রেস (Dokan Express)

এটি একটি প্রিমিয়াম নেক্সট-জেএস ই-কমার্স প্ল্যাটফর্ম।

## GitHub-এ কোড পুশ করার নিয়ম (Rafid-v1 Branch):

যদি GitHub-এ কোড পুশ করতে সমস্যা হয়, তবে নিচের কমান্ডগুলো আপনার পিসির টার্মিনালে এক এক করে লিখুন:

1. **গিট কনফিগার করুন (প্রথমবার হলে):**
   ```bash
   git config --global user.email "your-email@example.com"
   git config --global user.name "Your Name"
   ```

2. **গিট ইনিশিয়ালাইজ করুন ও ব্রাঞ্চ সেট করুন:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Rafid-v1 Perfect"
   ```

3. **গিটহাবের সাথে কানেক্ট করুন (আপনার লিংক দিন):**
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M Rafid-v1
   git push -u origin Rafid-v1
   ```

**নোট:** আমি একটি `.gitignore` ফাইল যোগ করেছি যা আপনার `node_modules` এবং `.next` ফোল্ডারকে গিটে যেতে বাধা দেবে, ফলে আপলোড অনেক দ্রুত হবে।
