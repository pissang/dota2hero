$cd "H:\dota2resources\heros\troll_warlord\smd"
$modelname "heroes/troll_warlord/troll_warlord.mdl"
$model "default" "troll_warlord_model.dmx.smd"

$lod 1
 {
  replacemodel "troll_warlord_model.dmx" "lod1_troll_warlord_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "wrist_R" 0.361  -16.066  -24.589  23.183  3.699  4.455
$hbox 0 "elbow_R" -31.956  -6.361  -5.297  -5.672  11.525  8.910
$hbox 0 "bicep_R" -33.516  -10.387  -8.842  -7.981  7.501  10.341
$hbox 0 "wrist_L" -23.183  -16.066  -24.589  -1.453  3.699  4.147
$hbox 0 "elbow_L" 2.341  -11.525  -8.910  31.901  6.361  5.297
$hbox 0 "bicep_L" 7.915  -8.803  -11.156  33.682  9.111  15.157
$hbox 0 "head" -14.831  -19.998  -13.538  25.902  21.108  20.685
$hbox 0 "spine2" -0.772  -24.238  -18.902  29.028  27.053  20.657
$hbox 0 "spine1" 5.596  -23.872  -2.243  9.849  -21.896  5.705
$hbox 0 "ankle_R" -25.444  -10.634  -12.314  7.888  10.255  11.168
$hbox 0 "knee_R" -44.128  -17.994  -12.878  -5.069  16.312  20.348
$hbox 0 "thigh_R" -37.296  -11.302  -11.191  -5.303  10.692  11.781
$hbox 0 "ankle_L" -7.889  -10.245  -11.372  25.443  10.645  12.110
$hbox 0 "knee_L" 5.070  -16.312  -20.348  44.128  17.994  12.878
$hbox 0 "thigh_L" 5.709  -10.692  -11.781  37.296  11.314  11.192
$hbox 0 "hip1_0" -11.138  -18.061  -6.839  10.189  19.725  14.825
$hboxset "hands"
$hbox 0 "wrist_R" 0.361  -16.066  -24.589  23.183  3.699  4.455
$hbox 0 "wrist_L" -23.183  -16.066  -24.589  -1.453  3.699  4.147
$hboxset "head"
$hbox 0 "head" -14.831  -19.998  -13.538  25.902  21.108  20.685
$hboxset "select_high"
$hbox 0 "spine1" -26.575  -33.538  -42.248  41.622  35.976  42.062
$hbox 0 "hip1_0" -36.774  -33.925  -102.358  42.168  35.589  4.209
$hboxset "feet"
$hbox 0 "ankle_R" -25.444  -10.634  -12.314  7.888  10.255  11.168
$hbox 0 "ankle_L" -7.889  -10.245  -11.372  25.443  10.645  12.110
$hboxset "select_low"
$hbox 0 "root" -83.160  -120.340  -109.666  80.356  122.779  69.803
$attachment "attach_attack1" "wrist_R" 12.00 -4.00 -11.00 rotate 0.00 -0.00 -0.00
$attachment "attach_attack2" "wrist_L" -12.00 -3.00 -7.00 rotate -0.00 0.00 0.00
$attachment "attach_hitloc" "spine2" 0.00 0.00 0.00 rotate -0.00 0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -8.903 0.664 97.057
$sequence BindPose "BindPose" fps 30.00
$sequence tw_loadout "tw_loadout" loop ACT_DOTA_LOADOUT 1 fps 24.00
$sequence tw_portrait "tw_portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence tw_idle_melee "tw_idle_melee" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tw_idle_melee_injured "tw_idle_melee_injured" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tw_idle_melee_injured_fast "tw_idle_melee_injured_fast" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tw_idle_melee_injured_faster "tw_idle_melee_injured_faster" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tw_idle_melee_injured_fastest "tw_idle_melee_injured_fastest" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tw_idle_melee_alt "tw_idle_melee_alt" ACT_DOTA_IDLE_RARE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 29 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 31 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 12 "Hero_TrollWarlord.IdleSpin" }
}

$sequence tw_run_melee "tw_run_melee" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 4 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 14 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_run_melee_haste "tw_run_melee_haste" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 4 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 14 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_run_melee_injured "tw_run_melee_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 3 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 13 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_stun_melee "tw_stun_melee" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tw_defeat_melee "tw_defeat_melee" loop ACT_DOTA_DEFEAT 1 fps 30.00
$sequence tw_attack_melee_fast "tw_attack_melee_fast" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_melee_faster "tw_attack_melee_faster" ACT_DOTA_ATTACK 1 fps 25.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_ranged_fast "tw_attack_ranged_fast" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 start_at_origin" }
}

$sequence tw_attack_ranged_faster "tw_attack_ranged_faster" ACT_DOTA_ATTACK 1 fps 25.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 start_at_origin" }
}

$sequence tw_attack_melee_fastest "tw_attack_melee_fastest" ACT_DOTA_ATTACK 1 fps 20.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_range_fastest "tw_attack_range_fastest" ACT_DOTA_ATTACK 1 fps 20.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 start_at_origin" }
}

$sequence tw_attack_melee_fast2 "tw_attack_melee_fast2" ACT_DOTA_ATTACK2 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_melee_faster2 "tw_attack_melee_faster2" ACT_DOTA_ATTACK2 1 fps 25.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_ranged_fast2 "tw_attack_ranged_fast2" ACT_DOTA_ATTACK2 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 start_at_origin" }
}

$sequence tw_attack_ranged_faster2 "tw_attack_ranged_faster2" ACT_DOTA_ATTACK2 1 fps 25.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 start_at_origin" }
}

$sequence tw_attack_melee_fastest2 "tw_attack_melee_fastest2" ACT_DOTA_ATTACK2 1 fps 20.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_6 follow_origin" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 17 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_range_fastest2 "tw_attack_range_fastest2" ACT_DOTA_ATTACK2 1 fps 20.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_melee "tw_attack_melee" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_melee_injured "tw_attack_melee_injured" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 7 "TROLL_WARLORD_MELEE_BLUR_1 follow_origin" }
}

$sequence tw_attack_melee_alt "tw_attack_melee_alt" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 5 "TROLL_WARLORD_MELEE_BLUR_2 follow_origin" }
}

$sequence tw_attack_melee_alt_injured "tw_attack_melee_alt_injured" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 5 "TROLL_WARLORD_MELEE_BLUR_2 follow_origin" }
}

$sequence tw_attack_melee_alt2 "tw_attack_melee_alt2" ACT_DOTA_ATTACK2 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 6 "TROLL_WARLORD_MELEE_BLUR_3 follow_origin" }
}

$sequence tw_attack_melee_alt2_injured "tw_attack_melee_alt2_injured" ACT_DOTA_ATTACK2 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 6 "TROLL_WARLORD_MELEE_BLUR_3 follow_origin" }
}

$sequence tw_attack_melee_alt3 "tw_attack_melee_alt3" ACT_DOTA_ATTACK2 4 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 6 "TROLL_WARLORD_MELEE_BLUR_4 follow_origin" }
}

$sequence tw_attack_melee_alt3_injured "tw_attack_melee_alt3_injured" ACT_DOTA_ATTACK2 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 6 "TROLL_WARLORD_MELEE_BLUR_4 follow_origin" }
}

$sequence tw_attack_melee_alt4 "tw_attack_melee_alt4" ACT_DOTA_ATTACK2 3 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 6 "TROLL_WARLORD_MELEE_BLUR_5 follow_origin" }
}

$sequence tw_attack_melee_alt4_injured "tw_attack_melee_alt4_injured" ACT_DOTA_ATTACK2 3 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 6 "TROLL_WARLORD_MELEE_BLUR_5 follow_origin" }
}

$sequence tw_cast1_ranged_to_melee "tw_cast1_ranged_to_melee" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence tw_cast2_whirl_axes_flip_melee "tw_cast2_whirl_axes_flip_melee" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence tw_cast4_battle_trance_melee "tw_cast4_battle_trance_melee" ACT_DOTA_CAST_ABILITY_4 1 fps 38.00
$sequence tw_death_melee "tw_death_melee" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 20 "Hero_TrollWarlord.Death" }
}

$sequence tw_death_melee_test "tw_death_melee_test" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 20 "Hero_TrollWarlord.Death" }
}

$sequence tw_death_melee_dropA "tw_death_melee_dropA" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 20 "Hero_TrollWarlord.Death" }
  { event AE_CL_PLAYSOUND 28 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_death_melee_alt "tw_death_melee_alt" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 24 "Hero_TrollWarlord.Death" }
}

$sequence tw_death_melee_alt_dropA "tw_death_melee_alt_dropA" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 24 "Hero_TrollWarlord.Death" }
}

$sequence tw_death_melee_alt_dropB "tw_death_melee_alt_dropB" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 24 "Hero_TrollWarlord.Death" }
}

$sequence tw_flail_melee "tw_flail_melee" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tw_teleport_end_melee "tw_teleport_end_melee" ACT_DOTA_TELEPORT_END 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 14 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 17 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_defeat_ranged "tw_defeat_ranged" loop ACT_DOTA_DEFEAT 1 fps 30.00
$sequence tw_idle_ranged "tw_idle_ranged" loop ACT_DOTA_IDLE 1 fps 24.00 {
  { event AE_CL_PLAYSOUND 12 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 25 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 36 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 48 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 60 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 72 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 85 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 97 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 108 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 120 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 132 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 144 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 156 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 168 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 180 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 192 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 205 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 216 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 229 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 240 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 252 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 264 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 276 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 288 "Hero_TrollWarlord.Footsteps.Idle" }
}

$sequence tw_idle_ranged_alt "tw_idle_ranged_alt" ACT_DOTA_IDLE_RARE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 29 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 31 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 12 "Hero_TrollWarlord.IdleSpin" }
}

$sequence tw_idle_ranged_injured "tw_idle_ranged_injured" loop ACT_DOTA_IDLE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 17 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 31 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_idle_ranged_injured_fast "tw_idle_ranged_injured_fast" loop ACT_DOTA_IDLE 1 fps 24.00 {
  { event AE_CL_PLAYSOUND 12 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 25 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 36 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 48 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 60 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 72 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 85 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 97 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 108 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 120 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 132 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 144 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 156 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 168 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 180 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 192 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 205 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 216 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 229 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 240 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 252 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 264 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 276 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 288 "Hero_TrollWarlord.Footsteps.Idle" }
}

$sequence tw_idle_ranged_injured_faster "tw_idle_ranged_injured_faster" loop ACT_DOTA_IDLE 1 fps 24.00 {
  { event AE_CL_PLAYSOUND 12 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 25 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 36 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 48 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 60 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 72 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 85 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 97 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 108 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 120 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 132 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 144 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 156 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 168 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 180 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 192 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 205 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 216 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 229 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 240 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 252 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 264 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 276 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 288 "Hero_TrollWarlord.Footsteps.Idle" }
}

$sequence tw_idle_ranged_injured_fastest "tw_idle_ranged_injured_fastest" loop ACT_DOTA_IDLE 1 fps 24.00 {
  { event AE_CL_PLAYSOUND 12 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 25 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 36 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 48 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 60 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 72 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 85 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 97 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 108 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 120 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 132 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 144 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 156 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 168 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 180 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 192 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 205 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 216 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 229 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 240 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 252 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 264 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 276 "Hero_TrollWarlord.Footsteps.Idle" }
  { event AE_CL_PLAYSOUND 288 "Hero_TrollWarlord.Footsteps.Idle" }
}

$sequence tw_attack_ranged "tw_attack_ranged" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tw_attack_ranged_injured "tw_attack_ranged_injured" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tw_attack_ranged_alt "tw_attack_ranged_alt" ACT_DOTA_ATTACK2 1 fps 30.00
$sequence tw_attack_ranged_alt_injured "tw_attack_ranged_alt_injured" ACT_DOTA_ATTACK2 1 fps 30.00
$sequence tw_death_ranged "tw_death_ranged" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 20 "Hero_TrollWarlord.Death" }
}

$sequence tw_death_ranged_dropA "tw_death_ranged_dropA" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 20 "Hero_TrollWarlord.Death" }
}

$sequence tw_death_ranged_forward "tw_death_ranged_forward" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 20 "Hero_TrollWarlord.Death" }
}

$sequence tw_death_ranged_alt "tw_death_ranged_alt" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 24 "Hero_TrollWarlord.Death" }
}

$sequence tw_death_ranged_alt_dropA "tw_death_ranged_alt_dropA" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 24 "Hero_TrollWarlord.Death" }
}

$sequence tw_run_ranged "tw_run_ranged" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 3 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 13 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_run_ranged_haste "tw_run_ranged_haste" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 4 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 13 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_run_ranged_injured "tw_run_ranged_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 3 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 13 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_stun_ranged "tw_stun_ranged" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tw_cast1_melee_to_ranged "tw_cast1_melee_to_ranged" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence tw_cast2_whirl_axes_ranged "tw_cast2_whirl_axes_ranged" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence tw_cast4_battle_trance_ranged "tw_cast4_battle_trance_ranged" ACT_DOTA_CAST_ABILITY_4 1 fps 38.00
$sequence tw_flail_ranged "tw_flail_ranged" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tw_teleport_end_ranged "tw_teleport_end_ranged" ACT_DOTA_TELEPORT_END 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 14 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 17 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_spawn "tw_spawn" ACT_DOTA_SPAWN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 14 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 17 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_spawn_flip "tw_spawn_flip" ACT_DOTA_SPAWN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 15 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 18 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_victory "tw_victory" ACT_DOTA_VICTORY 1 fps 33.00
$sequence tw_teleport "tw_teleport" loop ACT_DOTA_TELEPORT 1 fps 30.00
$sequence tw_forcestaff "tw_forcestaff" ACT_DOTA_FLAIL 1 fps 30.00
$sequence tw_forcestaff_melee "tw_forcestaff_melee" ACT_DOTA_FLAIL 1 fps 30.00
$sequence tw_forcestaff_end_ranged "tw_forcestaff_end_ranged" ACT_DOTA_FORCESTAFF_END 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 5 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 7 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_forcestaff_end_melee "tw_forcestaff_end_melee" ACT_DOTA_FORCESTAFF_END 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 5 "Hero_TrollWarlord.Footsteps" }
  { event AE_CL_PLAYSOUND 7 "Hero_TrollWarlord.Footsteps" }
}

$sequence tw_turns_melee_lookFrame_0 "tw_turns_melee_lookFrame_0" fps 30.00
$sequence tw_turns_melee_lookFrame_1 "tw_turns_melee_lookFrame_1" fps 30.00
$sequence tw_turns_melee_lookFrame_2 "tw_turns_melee_lookFrame_2" fps 30.00
$sequence tw_turns_melee_dupe1_lookFrame_0 "tw_turns_melee_dupe1_lookFrame_0" fps 30.00
$sequence tw_turns_melee_dupe1_lookFrame_1 "tw_turns_melee_dupe1_lookFrame_1" fps 30.00
$sequence tw_turns_melee_dupe1_lookFrame_2 "tw_turns_melee_dupe1_lookFrame_2" fps 30.00
$sequence tw_turns_melee_dupe2_lookFrame_0 "tw_turns_melee_dupe2_lookFrame_0" fps 30.00
$sequence tw_turns_melee_dupe2_lookFrame_1 "tw_turns_melee_dupe2_lookFrame_1" fps 30.00
$sequence tw_turns_melee_dupe2_lookFrame_2 "tw_turns_melee_dupe2_lookFrame_2" fps 30.00
$sequence tw_turns_ranged_lookFrame_0 "tw_turns_ranged_lookFrame_0" fps 30.00
$sequence tw_turns_ranged_lookFrame_1 "tw_turns_ranged_lookFrame_1" fps 30.00
$sequence tw_turns_ranged_lookFrame_2 "tw_turns_ranged_lookFrame_2" fps 30.00
$sequence tw_turns_ranged_dupe1_lookFrame_0 "tw_turns_ranged_dupe1_lookFrame_0" fps 30.00
$sequence tw_turns_ranged_dupe1_lookFrame_1 "tw_turns_ranged_dupe1_lookFrame_1" fps 30.00
$sequence tw_turns_ranged_dupe1_lookFrame_2 "tw_turns_ranged_dupe1_lookFrame_2" fps 30.00
$sequence tw_turns_ranged_dupe2_lookFrame_0 "tw_turns_ranged_dupe2_lookFrame_0" fps 30.00
$sequence tw_turns_ranged_dupe2_lookFrame_1 "tw_turns_ranged_dupe2_lookFrame_1" fps 30.00
$sequence tw_turns_ranged_dupe2_lookFrame_2 "tw_turns_ranged_dupe2_lookFrame_2" fps 30.00
$sequence tw_turns_melee "tw_turns_melee_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 tw_turns_melee_lookFrame_0 tw_turns_melee_lookFrame_1 tw_turns_melee_lookFrame_2
}
$sequence tw_turns_melee_dupe1 "tw_turns_melee_dupe1_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 tw_turns_melee_dupe1_lookFrame_0 tw_turns_melee_dupe1_lookFrame_1 tw_turns_melee_dupe1_lookFrame_2
}
$sequence tw_turns_melee_dupe2 "tw_turns_melee_dupe2_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 tw_turns_melee_dupe2_lookFrame_0 tw_turns_melee_dupe2_lookFrame_1 tw_turns_melee_dupe2_lookFrame_2
}
$sequence tw_turns_ranged "tw_turns_ranged_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 tw_turns_ranged_lookFrame_0 tw_turns_ranged_lookFrame_1 tw_turns_ranged_lookFrame_2
}
$sequence tw_turns_ranged_dupe1 "tw_turns_ranged_dupe1_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 tw_turns_ranged_dupe1_lookFrame_0 tw_turns_ranged_dupe1_lookFrame_1 tw_turns_ranged_dupe1_lookFrame_2
}
$sequence tw_turns_ranged_dupe2 "tw_turns_ranged_dupe2_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 tw_turns_ranged_dupe2_lookFrame_0 tw_turns_ranged_dupe2_lookFrame_1 tw_turns_ranged_dupe2_lookFrame_2
}
