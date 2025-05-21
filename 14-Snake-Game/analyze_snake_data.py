import json
import pandas as pd
import matplotlib.pyplot as plt

# تحميل بيانات اللاعبين
with open("player_data.json", "r") as f:
    data = json.load(f)

# تحويل البيانات إلى DataFrame
df = pd.DataFrame(data)

# 🟡 طباعة معاينة سريعة
print(df.head())

# ✅ 1. تحليل مدة اللعب
if "totalDuration" in df.columns:
    durations = df[df["type"] == "game_over"]["totalDuration"]
    print("متوسط مدة اللعب:", durations.mean(), "ثانية")

# ✅ 2. تحليل عدد الأطعمة التي أُكلت
food_events = df[df["type"] == "food_eaten"]
print("عدد الأطعمة التي تم أكلها:", len(food_events))

# ✅ 3. تحليل الاتجاهات التي تم تغييرها
directions = df[df["type"] == "direction_change"]["direction"].value_counts()
print("عدد مرات تغيير الاتجاه حسب كل اتجاه:")
print(directions)

# ✅ 4. رسم الاتجاهات
plt.figure(figsize=(6,4))
directions.plot(kind="bar", color="skyblue")
plt.title("توزيع تغييرات الاتجاه")
plt.xlabel("الاتجاه")
plt.ylabel("عدد المرات")
plt.tight_layout()
plt.show()
