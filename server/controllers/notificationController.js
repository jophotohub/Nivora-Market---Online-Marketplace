import { getDb, saveDb } from "../db/store.js";
export async function getNotifications(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const db = getDb();
    const notifs = db.notifications.filter((n) => n.userId === userId || n.userId === "all");
    const unreadCount = notifs.filter((n) => !n.isRead).length;
    res.json({
      success: true,
      notifications: notifs,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const notif = db.notifications.find((n) => n._id === id);
    if (notif) {
      notif.isRead = true;
      saveDb();
    }
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const db = getDb();
    db.notifications.forEach((n) => {
      if (n.userId === userId || n.userId === "all") {
        n.isRead = true;
      }
    });
    saveDb();
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
