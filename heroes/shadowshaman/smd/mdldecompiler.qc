$cd "H:\dota2resources\heros\shadowshaman\smd"
$modelname "heroes/shadowshaman/shadowshaman.mdl"
$model "default" "shadowshaman_model.dmx.smd"

$lod 1
 {
  replacemodel "shadowshaman_model.dmx" "lod1_shadowshaman_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "wrist_R" -19.976  -6.893  -9.170  -1.267  4.247  7.788
$hbox 0 "elbow_R" -24.748  -4.471  -4.609  3.360  4.501  4.675
$hbox 0 "bicep_R" -26.060  -6.490  -6.780  3.952  4.347  4.345
$hbox 0 "wrist_L" -0.649  -4.165  -6.987  17.554  6.760  9.643
$hbox 0 "elbow_L" -3.928  -4.865  -4.691  25.572  4.907  4.704
$hbox 0 "bicep_L" -4.858  -4.516  -4.976  27.036  6.073  7.532
$hbox 0 "head" -7.404  -7.955  -15.807  15.284  7.955  16.453
$hbox 0 "spine3" -12.476  -20.526  -16.778  14.567  20.526  10.069
$hbox 0 "spine1" -1.961  -14.574  -15.622  25.767  14.570  11.830
$hbox 0 "ankle_R" -16.418  -6.134  -7.468  4.119  5.450  5.205
$hbox 0 "knee_R" -31.055  -3.993  -5.286  2.599  4.680  6.771
$hbox 0 "thigh_R" -35.227  -4.617  -5.295  0.083  7.318  6.616
$hbox 0 "ankle_L" -4.119  -5.949  -5.700  16.418  5.876  6.343
$hbox 0 "knee_L" -0.764  -5.369  -6.122  30.032  4.581  4.780
$hbox 0 "thigh_L" -1.235  -7.622  -6.891  36.484  4.525  9.515
$hbox 0 "root" -12.347  -19.472  -15.472  18.365  19.244  16.133
$hboxset "weapon"
$hbox 0 "rtStaff_1" -37.358  -7.745  -9.967  38.679  8.578  8.068
$hbox 0 "lfStaff_2" -37.840  -7.452  -9.449  36.627  8.558  8.328
$hboxset "hands"
$hbox 0 "wrist_R" -19.976  -6.893  -9.170  -1.267  4.247  7.788
$hbox 0 "wrist_L" -0.649  -4.165  -6.987  17.554  6.760  9.643
$hboxset "head"
$hbox 0 "head" -7.404  -7.955  -15.807  15.284  7.955  16.453
$hboxset "feet"
$hbox 0 "ankle_R" -16.418  -6.134  -7.468  4.119  5.450  5.205
$hbox 0 "ankle_L" -4.119  -5.949  -5.700  16.418  5.876  6.343
$hboxset "select_high"
$hbox 0 "root" -20.530  -42.658  -64.825  40.565  45.016  11.200
$hbox 0 "root" -5.982  -31.544  11.064  41.881  31.360  49.578
$hboxset "select_low"
$hbox 0 "root" -54.908  -72.210  -65.238  82.691  74.568  56.459
$attachment "attach_attack1" "rtStaff_1" 32.00 -0.00 0.00 rotate -0.00 -0.00 -0.00
$attachment "attach_attack2" "lfStaff_2" -32.00 0.00 -0.00 rotate -0.00 0.00 -0.00
$attachment "attach_hitloc" "spine3" 0.00 0.00 0.00 rotate 0.00 -0.00 -0.00
$attachment "ArbitraryChain5_plc5" "jug5_0" -123.91 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "Thumb_plc0_L" "New_Skirt_R3C0" -3.81 -10.38 5.31 rotate -0.00 0.00 0.00
$attachment "Index_plc0_L" "New_Skirt_R3C1" 12.39 -30.68 5.34 rotate -0.00 0.00 -0.00
$attachment "Mid_plc0_L" "New_Skirt_R3C2" 12.39 -32.12 -3.26 rotate 0.00 0.00 0.00
$attachment "Ring_plc0_L" "New_Skirt_R3C3" 13.13 7.16 0.00 rotate 0.00 -0.00 0.00
$attachment "Thumb_plc1_R" "Thumb_1_R" -7.23 -0.66 0.39 rotate 5.91 34.53 23.68
$attachment "Index_plc1_R" "Index_1_R" -6.06 0.33 -0.11 rotate -3.17 -9.51 -57.65
$attachment "Mid_plc1_R" "Mid_1_R" -8.49 0.00 0.12 rotate 3.36 0.00 -90.00
$attachment "Ring_plc1_R" "wrist_R" -20.08 0.84 -16.65 rotate -50.38 -36.36 5.85
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -9.379 -0.410 63.609
$sequence BindPose "BindPose" fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 18 "BodyImpact_Common.Light" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 9 fps 30.00
$sequence attack1 "attack1" ACT_DOTA_ATTACK 4 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 8 }
}

$sequence attack2 "attack2" ACT_DOTA_ATTACK2 4 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 9 }
}

$sequence attack3 "attack3" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 8 }
}

$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_ShadowShaman.Footsteps" }
  { event AE_CL_PLAYSOUND 11 "Hero_ShadowShaman.Footsteps" }
}

$sequence run_haste "run_haste" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_ShadowShaman.Footsteps" }
  { event AE_CL_PLAYSOUND 11 "Hero_ShadowShaman.Footsteps" }
}

$sequence run_injured "run_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_ShadowShaman.Footsteps" }
  { event AE_CL_PLAYSOUND 11 "Hero_ShadowShaman.Footsteps" }
}

$sequence idle_injured "idle_injured" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence run_chase "run_chase" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_ShadowShaman.Footsteps" }
  { event AE_CL_PLAYSOUND 11 "Hero_ShadowShaman.Footsteps" }
}

$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence cast_ether_shock "cast_ether_shock" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence cast_voodoo "cast_voodoo" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence cast_mass_serpent_ward "cast_mass_serpent_ward" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 22 "Hero_ShadowShaman.Footsteps" }
  { event AE_CL_PLAYSOUND 25 "Hero_ShadowShaman.Footsteps" }
}

$sequence channel_shackles "channel_shackles" loop ACT_DOTA_CHANNEL_ABILITY_3 20 fps 30.00
$sequence cast_channel_shackles "cast_channel_shackles" ACT_DOTA_CAST_CHANNEL_ABILITY_3 10 fps 30.00
$sequence idle_alt "idle_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence portrait "portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 17 "Hero_ShadowShaman.Footsteps" }
  { event AE_CL_PLAYSOUND 20 "Hero_ShadowShaman.Footsteps" }
}

$sequence shadowshaman_teleport "shadowshaman_teleport" ACT_DOTA_TELEPORT 1 fps 30.00
$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 14 "Hero_ShadowShaman.Footsteps" }
  { event AE_CL_PLAYSOUND 16 "Hero_ShadowShaman.Footsteps" }
}

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
$sequence turn layer_lookFrame_0 "turn layer_lookFrame_0" fps 30.00
$sequence turn layer_lookFrame_1 "turn layer_lookFrame_1" fps 30.00
$sequence turn layer_lookFrame_2 "turn layer_lookFrame_2" fps 30.00
$sequence turn layer "turn layer_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turn layer_lookFrame_0 turn layer_lookFrame_1 turn layer_lookFrame_2
}
