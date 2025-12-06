/*
 * -----------------------------------------
 * Fantasy Adventure: GodStart Auto Equipment Mod
 * -----------------------------------------
 * 功能：在玩家“选择职业”后，自动装备最强开局套装
 *
 * 套装内容：
 *  - 武器：虛空破滅劍 (w_void_breaker)
 *  - 防具：末世之鎧 (a_apocalypse)
 *  - 盾牌：魔神之壁 (s_demon_wall)
 *  - 飾品：命運之輪 (acc_wheel)
 *        ：混沌魔方 (acc_chaos)
 *        ：超越魔方 (acc_transcendence)
 *
 * 注意：本补丁不修改原本遊戲邏輯，只“接管 + 擴充” selectClass()
 * -----------------------------------------
 * 作者：积宏 & ChatGPT
 * 版本：1.0
 */

(function () {

    /* 可開關除錯訊息（true = 顯示 debug log） */
    const DEBUG = false;
    const log = (...msg) => DEBUG && console.log("[GodStart]", ...msg);

    /** 自动执行装备逻辑 */
    function applyGodStart() {

        // 🚫 如果主程式未載入，則不執行（避免報錯）
        if (typeof Player === "undefined" || typeof CONFIG === "undefined" || typeof Game === "undefined") {
            log("Player / CONFIG / Game 尚未就緒，跳過");
            return;
        }

        // 🛡 確保資料結構存在（避免 undefined 錯誤）
        if (!Player.equipment) {
            Player.equipment = {
                weapon: null,
                armor: null,
                shield: null,
                accessories: [null, null, null]
            };
        }
        if (!Player.equipment.accessories) {
            Player.equipment.accessories = [null, null, null];
        }
        if (!Player.history) Player.history = { items: new Set() };
        else if (!Player.history.items) Player.history.items = new Set();

        const inferno = CONFIG.infernoItems || [];
        const clone = id => {
            const tpl = inferno.find(x => x.id === id);
            return tpl ? { ...tpl } : null;
        };

        // 🪄 給主裝備
        function equip(slot, item) {
            if (!item) return;
            if (Player.equipment[slot]) Game.addItemToInventory(Player.equipment[slot], false);
            Player.equipment[slot] = item;
            try { Player.history.items.add(item.name); } catch (e) {}
        }

        // 💍 給飾品
        function equipAcc(i, item) {
            if (!item) return;
            if (Player.equipment.accessories[i]) {
                Game.addItemToInventory(Player.equipment.accessories[i], false);
            }
            Player.equipment.accessories[i] = item;
            try { Player.history.items.add(item.name); } catch (e) {}
        }

        // 🎁 六件最強套裝
        equip("weapon", clone("w_void_breaker"));
        equip("armor",  clone("a_apocalypse"));
        equip("shield", clone("s_demon_wall"));
        equipAcc(0, clone("acc_wheel"));
        equipAcc(1, clone("acc_chaos"));
        equipAcc(2, clone("acc_transcendence"));

        // 🔄 更新畫面 & 屬性
        Game.recalcStats?.();
        Game.updateUI?.();
        Game.log?.("🌟 已自動套用最強開局套裝（GodStart Mod）");
    }

    /** 等待 Game 載入後，再接管 selectClass() */
    function installWhenReady() {
        log("等待 Game 模組載入中…");

        const timer = setInterval(() => {
            if (typeof Game === "undefined") return; // 尚未載入

            clearInterval(timer);

            // 保留原本的職業邏輯
            const oldSelect = Game.selectClass;

            // 注入 applyGodStart()
            Game.applyGodStart = applyGodStart;

            Game.selectClass = function (classType) {
                oldSelect?.call(Game, classType);
                applyGodStart(); // 🪄 選完職業後自動套神裝
            };

            console.log("🔥 GodStart 模組已安裝完成（開局自動穿最強套裝）");
        }, 200);
    }

    // 🚀 啟動補丁
    installWhenReady();

})();
