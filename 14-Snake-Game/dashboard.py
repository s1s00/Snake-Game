# dashboard.py
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# تحميل البيانات
df = pd.read_json("session_data.json")  # عدّل الاسم حسب ملفك

# ---------------------------
# العنوان العام
st.title("📊 لوحة تحكم تحليلات Snake Game")

# ---------------------------
# 1. حركات اللاعبين (x, y)
st.header("🧭 حركة اللاعبين")
fig1, ax1 = plt.subplots()
for pid, group in df.groupby("player_id"):
    ax1.plot(group["x"], group["y"], marker='o', label=f"لاعب {pid}")
ax1.set_xlabel("X")
ax1.set_ylabel("Y")
ax1.legend()
st.pyplot(fig1)

# ---------------------------
# 2. توزيع النجاح والفشل
st.header("✅❌ توزيع النتائج")
if "result" in df.columns:
    result_counts = df["result"].value_counts()
    st.bar_chart(result_counts)

# ---------------------------
# 3. أوقات اللعب
st.header("⏰ أوقات اللعب")
df["timestamp"] = pd.to_datetime(df["timestamp"])
df["hour"] = df["timestamp"].dt.hour
st.line_chart(df["hour"].value_counts().sort_index())

# ---------------------------
# 4. Heatmap سلوك المستخدم
st.header("🔥 الخريطة الحرارية لحركة اللاعبين")
heatmap_data = df.groupby(["y", "x"]).size().unstack(fill_value=0)
fig2, ax2 = plt.subplots()
sns.heatmap(heatmap_data, cmap="YlOrRd", ax=ax2)
st.pyplot(fig2)
