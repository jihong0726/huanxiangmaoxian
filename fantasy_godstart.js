// fantasy_godstart.js
(function () {
    function applyGodStart() {
        if (!window.Player || !window.CONFIG || !window.Game) {
            return;
        }

        // 确保结构存在
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
        if (!Player.history) {
            Player.history = { items: new Set() };
        } else if (!Player.history.items) {
            Player.history.items = new Set();
        }

        var inferno = CONFIG.infernoItems || [];

        function findById(id) {
            for (var i = 0; i < inferno.length; i++) {
                if (inferno[i].id === id) return inferno[i];
            }
            return null;
        }

        function cloneItem(tpl) {
            var copy = {};
            for (var k in tpl) {
                if (Object.prototype.hasOwnProperty.call(tpl, k)) {
                    copy[k] = tpl[k];
                }
            }
            return copy;
        }

        function unlockToHistory(item) {
            try {
                if (Player.history && Player.history.items && typeof Player.history.items.add === "function") {
                    Player.history.items.add(item.name);
                }
            } catch (e) {}
        }

        function equipMain(slot, item) {
            if (!item) return;
            // 原本穿着的装备丢回背包
            if (Player.equipment[slot]) {
                Game.addItemToInventory(Player.equipment[slot], false);
            }
            Player.equipment[slot] = item;
            unlockToHistory(item);
        }

        function equipAccessory(slotIdx, item) {
            if (!item) return;
            if (!Player.equipment.accessories) {
                Player.equipment.accessories = [null, null, null];
            }
            if (Player.equipment.accessories[slotIdx]) {
                Game.addItemToInventory(Player.equipment.accessories[slotIdx], false);
            }
            Player.equipment.accessories[slotIdx] = item;
            unlockToHistory(item);
        }

        // 这六件就是之前我们分析的最强组合：
        // 武器：虛空破滅劍 w_void_breaker
        // 防具：末世之鎧   a_apocalypse
        // 盾牌：魔神之壁   s_demon_wall
        // 饰品：命運之輪 acc_wheel
        //       混沌魔方 acc_chaos
        //       超越魔方 acc_transcendence
        var wVoid  = findById("w_void_breaker");
        var aApoc  = findById("a_apocalypse");
        var sWall  = findById("s_demon_wall");
        var accWheel = findById("acc_wheel");
        var accChaos = findById("acc_chaos");
        var accTrans = findById("acc_transcendence");

        var wItem  = wVoid  ? cloneItem(wVoid)  : null;
        var aItem  = aApoc  ? cloneItem(aApoc)  : null;
        var sItem  = sWall  ? cloneItem(sWall)  : null;
        var wheel  = accWheel ? cloneItem(accWheel) : null;
        var chaos  = accChaos ? cloneItem(accChaos) : null;
        var trans  = accTrans ? cloneItem(accTrans) : null;

        // 主装备 3 件
        equipMain("weapon", wItem);
        equipMain("armor",  aItem);
        equipMain("shield", sItem);

        // 饰品 3 个，占满 3 格
        equipAccessory(0, wheel);
        equipAccessory(1, chaos);
        equipAccessory(2, trans);

        if (typeof Game.recalcStats === "function") {
            Game.recalcStats();
        }
        if (typeof Game.updateUI === "function") {
            Game.updateUI();
        }
        if (typeof Game.log === "function") {
            Game.log("🌟 已自動套用最強開局套裝：虛空破滅劍 + 末世之鎧 + 魔神之壁 + 命運之輪 + 混沌魔方 + 超越魔方");
        }
    }

    function install() {
        if (!window.Game) return;

        var oldSelect = Game.selectClass;
        Game.applyGodStart = applyGodStart;

        // 接管職業選擇：不改你原本的邏輯，只是選完職業後再幫你穿神裝
        Game.selectClass = function (classType) {
            if (typeof oldSelect === "function") {
                oldSelect.call(Game, classType);
            }
            applyGodStart();
        };
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        install();
    } else {
        window.addEventListener("DOMContentLoaded", install);
    }
})();
