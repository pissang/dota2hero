$cd "H:\dota2resources\heros\tidehunter\smd"
$modelname "heroes/tidehunter/tidehunter.mdl"
$model "default" "tidehunter_model.dmx.smd"

$lod 1
 {
  replacemodel "tidehunter_model.dmx" "lod1_tidehunter_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "hook_R2C0" -15.421  -8.491  -18.257  37.432  8.030  16.614
$hbox 0 "hook_R1C0" -8.103  -17.723  -8.661  36.333  23.298  8.023
$hbox 0 "hook_1" -22.250  -46.123  -8.968  137.802  54.839  9.276
$hbox 0 "wrist_R" -30.526  -11.781  -14.459  2.030  6.707  12.118
$hbox 0 "elbow_R" -54.679  -17.013  -23.922  -3.486  17.519  18.084
$hbox 0 "bicep_R" -48.652  -20.675  -20.508  -3.237  21.060  19.984
$hbox 0 "wrist_L" 2.066  -6.707  -11.133  34.386  11.482  14.459
$hbox 0 "elbow_L" -0.908  -20.994  -12.284  53.163  18.822  19.598
$hbox 0 "bicep_L" 3.237  -14.134  -22.081  48.652  13.876  22.660
$hbox 0 "head" -6.194  -20.753  -35.428  51.853  20.753  21.615
$hbox 0 "spine2" -14.598  -56.501  -48.827  60.473  56.501  45.389
$hbox 0 "ankle_R" -22.169  -21.650  -16.444  18.216  20.718  16.690
$hbox 0 "knee_R" -33.710  -13.830  -14.147  -4.760  12.316  13.940
$hbox 0 "thigh_R" -37.125  -13.868  -26.808  -0.066  19.293  21.472
$hbox 0 "tail0_1" -10.493  -16.492  -16.482  34.985  16.492  9.314
$hbox 0 "ankle_L" -15.239  -18.721  -8.985  21.924  24.288  16.821
$hbox 0 "knee_L" 4.929  -12.723  -15.033  34.902  14.288  15.256
$hbox 0 "thigh_L" 0.066  -21.975  -18.644  37.125  13.212  23.277
$hbox 0 "root1" -44.238  -42.041  -32.141  43.802  42.041  40.668
$hboxset "weapon"
$hbox 0 "hook_1" -22.250  -46.123  -8.968  137.802  54.839  9.276
$hbox 0 "hook_R2C0" -15.421  -8.491  -18.257  37.432  8.030  16.614
$hbox 0 "hook_R1C0" -8.103  -17.723  -8.661  36.333  23.298  8.023
$hboxset "hands"
$hbox 0 "wrist_R" -30.526  -11.781  -14.459  2.030  6.707  12.118
$hbox 0 "wrist_R" -20.869  -11.706  -13.592  3.261  5.588  11.274
$hbox 0 "wrist_L" 2.066  -6.707  -11.133  34.386  11.482  14.459
$hbox 0 "wrist_L" 1.175  -6.736  -11.152  20.763  10.797  14.773
$hboxset "head"
$hbox 0 "head" -11.020  -21.814  -38.753  49.676  21.814  21.655
$hboxset "feet"
$hbox 0 "ankle_R" -22.169  -21.650  -16.444  18.216  20.718  16.690
$hbox 0 "ankle_L" -15.239  -18.721  -8.985  21.924  24.288  16.821
$hboxset "select_high"
$hbox 0 "root1" -19.796  -48.095  24.045  71.868  48.095  112.952
$hbox 0 "root1" -32.196  -45.786  -92.677  56.193  45.786  25.309
$hboxset "select_low"
$hbox 0 "root1" -53.358  -84.584  -90.838  93.468  84.584  116.848
$attachment "ArbitraryChain1_plc1" "hook_R2C0" 91.70 -0.00 -0.00 rotate 0.00 -0.00 -0.00
$attachment "attach_impact" "hook_1" 120.00 0.00 0.00 rotate -0.00 0.00 -0.00
$attachment "attach_attack1" "wrist_R" 0.00 0.00 0.00 rotate 0.00 -0.00 -0.00
$attachment "WeaponRoot1_plc1" "offhand_weapon" 182.50 182.50 182.50 rotate 0.00 0.00 -0.00
$attachment "ArbitraryChain4_plc4" "tongue_1" 91.70 -0.00 -0.00 rotate -0.00 -0.00 -0.00
$attachment "attach_attack2" "jaw3_0" 0.00 0.00 0.00 rotate -0.00 0.00 -0.00
$attachment "ArbitraryChain5_plc5" "neckFat" 182.50 0.00 -0.00 rotate 0.00 0.00 -0.00
$attachment "attach_hitloc" "spine3" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "ArbitraryChain2_plc2" "buckle" 182.50 -0.00 0.00 rotate -0.00 -0.00 0.00
$attachment "ArbitraryChain6_plc6" "knife" 182.50 0.00 0.00 rotate 0.00 0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 41.671 0.154 100.750
$sequence BindPose "BindPose" fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 4 "Hero_Tidehunter.Footsteps" }
  { event AE_CL_PLAYSOUND 20 "Hero_Tidehunter.Footsteps" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 10 fps 30.00
$sequence idle_alt "idle_alt" loop ACT_DOTA_IDLE_RARE 4 fps 30.00
$sequence idle_alt_2 "idle_alt_2" loop ACT_DOTA_IDLE_RARE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 4 "Hero_Tidehunter.Idle_shake" }
}

$sequence idle_alt_unique "idle_alt_unique" loop ACT_DOTA_IDLE_RARE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 72 "Hero_Tidehunter.Idle_bite" }
}

$sequence portrait "portrait" loop ACT_DOTA_CAPTURE 10 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 28 "BodyImpact_Common.Heavy" }
}

$sequence death_alt "death_alt" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 26 "BodyImpact_Common.Heavy" }
}

$sequence attack1 "attack1" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack1_boat "attack1_boat" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TIDEHUNTER_ATTACK_IMPACT_BOAT follow_attachment attach_impact" }
}

$sequence fish_attack "fish_attack" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack_alt "attack_alt" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack_alt_boat "attack_alt_boat" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TIDEHUNTER_ATTACK_IMPACT_BOAT follow_attachment attach_impact" }
}

$sequence gush "gush" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence anchor_smash "anchor_smash" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00
$sequence ravage "ravage" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence ravage_belly_flop "ravage_belly_flop" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence toss_fish "toss_fish" ACT_DOTA_TAUNT 1 fps 30.00
$sequence yippy "yippy" ACT_DOTA_TAUNT 1 fps 30.00
$sequence batter_up "batter_up" ACT_DOTA_TAUNT 1 fps 30.00
$sequence ground_pound "ground_pound" ACT_DOTA_TAUNT 1 fps 30.00
$sequence workshop_anim_00 "workshop_anim_00" fps 30.00
$sequence workshop_anim_01 "workshop_anim_01" fps 30.00
$sequence workshop_anim_02 "workshop_anim_02" fps 30.00
$sequence workshop_anim_03 "workshop_anim_03" fps 30.00
$sequence workshop_anim_04 "workshop_anim_04" fps 30.00
$sequence workshop_anim_05 "workshop_anim_05" fps 30.00
$sequence workshop_anim_06 "workshop_anim_06" fps 30.00
$sequence workshop_anim_07 "workshop_anim_07" fps 30.00
$sequence workshop_anim_08 "workshop_anim_08" fps 30.00
$sequence workshop_anim_09 "workshop_anim_09" fps 30.00
$sequence teleport "teleport" loop ACT_DOTA_TELEPORT 1 fps 30.00
$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 20.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 15.00
$sequence death_by_sniper "death_by_sniper" ACT_DOTA_DEATH_BY_SNIPER 1 fps 30.00
$sequence taunt_laugh "taunt_laugh" ACT_DOTA_BRIDGE_THREAT 1 fps 30.00 {
  { event AE_CL_SPEECH 0 "TLK_DOTA_TAUNT|taunt_type=tide_laugh_04" }
}

$sequence bridge_destroy "bridge_destroy" ACT_DOTA_BRIDGE_DESTROY 1 fps 30.00
$sequence tidehunter_intro "tidehunter_intro" ACT_DOTA_INTRO 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 17 "Tutorial_Sniper.tidehunter_intro" }
  { event AE_CL_PLAYSOUND 90 "Tutorial_Sniper.tidehunter_intro.VO" }
}

$sequence tidehunter_intro_position_fix "tidehunter_intro_position_fix" loop ACT_DOTA_INTRO_LOOP 1 fps 30.00
$sequence death_by_sniper_cliff_fall "death_by_sniper_cliff_fall" ACT_DOTA_DEATH_FALL 1 fps 30.00
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 30.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 30.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 30.00
$sequence turns "turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
