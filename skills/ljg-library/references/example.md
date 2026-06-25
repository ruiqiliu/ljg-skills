# Worked frame 范例（两 mold 各一张）

照搬改 frame 即可。frame 只写「画什么」（继刚作主角的构图 + 隐喻物件 + 中文标注），**风格词不用写**——`gen_illustration.py` 的 `--mold` 已内置风格 DNA。

## 概念：《非对称风险》遍历性

意向画面（见 extraction.md 示例 A）：很多人各玩一次平均 +5%；但「你」沿一条时间线走，路上一道吸收壁（破产/归零，进去出不来），正期望也通向归零。继刚 = 那个走时间线的「你」。

### mold -a（动物森友会，默认）

```bash
python3 assets/gen_illustration.py --mold a \
  --frame "On the RIGHT, the villager-man walks alone along a single narrowing wooden plank tilting toward a dark whirlpool pit in teal water (an absorbing trap, fall in and cannot climb out). On the UPPER-LEFT, a row of cute Animal-Crossing villagers strolls on a flat safe grassy path. Labels: 你一个人玩很久 (near the man) / 很多人各玩一次 +5% (near villagers) / 一道吸收壁 (small wooden sign by the hole) / 进去出不来 (under the hole)." \
  --out /tmp/ljg_lib_ergodicity_a.png
```

出图：继刚作动森村民走木板奔向青水漩涡，村民群在安全草径，木牌「一道吸收壁」「进去出不来」。验过：~/Downloads/非对称风险-取景框卡-动森.png（整卡）、proto-ergodicity-animalcrossing.png。

### mold -b（吉田诚治）——《千脑智能》参考系投票（真生过验过）

意向画面：一个大脑不是一个观察者，而是上千根皮质柱各用一张「参考系」地图给同一个物体建完整模型，你看见的「一个东西」是这上千张地图投票出的共识。继刚 = 前景那根正在画地图的柱子。

```bash
python3 assets/gen_illustration.py --mold b \
  --frame "A warm circular library-hall, cozy and lived-in with wooden beams, bookshelves and plants. In the FOREGROUND the protagonist sits at a small wooden desk under a glowing brass lamp, carefully drawing a grid/coordinate MAP of a single coffee cup that stands on his desk. Behind and around him the SAME scene repeats into the distance — tier upon tier of hundreds of identical little lamplit desks, each with a small figure drawing his own map of the SAME coffee cup. Soft glowing lines rise from all the desks and converge upward onto ONE large clear coffee cup floating above the centre of the hall, as if all the maps are voting to agree on it. Warm low sunlight, honey and amber tones. Labels: 参考系地图 (on the map he is drawing) / 上千根柱子 (across the tiers of desks behind him) / 投票出共识 (near the converging glowing lines) / 一个杯子 (under the single floating cup above)." \
  --out /tmp/ljg_lib_qiannao_sketch.png
```

出图：暖光圆形书馆，继刚在前景桌上画参考系网格地图，身后层层叠叠上百张小灯桌各画同一只杯子，光线汇聚到顶上悬浮的咖啡杯＝投票共识；四个中文标注全对、继刚认得出、吉田诚治暖光厅堂氛围到位。验过：~/Downloads/千脑智能-取景框卡-吉田诚治.png（整卡）、/tmp/ljg_lib_qiannao_sketch.png（图解）。frame 不写风格词（暖光绘本感由 `--mold b` 内置）。

## 写 frame 的复用要点

- **主角先定位**：继刚（你）在哪、朝哪、在做什么核心动作。
- **隐喻物件落实**：把抽象命题换成可见物（木板/桥/漩涡/驾驶座/旧车…）。
- **对比/流向**：谁在安全侧、谁在危险侧、信息/箭头朝哪。
- **标注 3-5 个、每个 2-8 字**，标清挂在哪个元素旁。
- **风格交给 --mold**，frame 里别写"动森/吉田诚治/暖光/绘本"这类风格词（会和内置 DNA 打架）。
- 生图后**必 Read 验**：继刚认得出、画面读得懂、中文不糊；不行调 frame 重生。
