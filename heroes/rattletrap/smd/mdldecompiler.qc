$cd "H:\dota2resources\heros\rattletrap\smd"
$modelname "heroes/rattletrap/rattletrap.mdl"
$model "default" "rattletrap_model.dmx.smd"

$lod 1
 {
  replacemodel "rattletrap_model.dmx" "lod1_rattletrap_model.dmx"
}
$model "rocket" "Rattletrap_Rocket_attached_model.dmx.smd"

$lod 1
 {
  replacemodel "Rattletrap_Rocket_attached_model.dmx" "lod1_Rattletrap_Rocket_attached_model.dmx"
}
$model "rocket" "UnknownModelName.smd"

$lod 1
 {
  replacemodel "UnknownModelName" "lod1_UnknownModelName"
}
$model "hookshot" "Rattletrap_Hook_attached_model.dmx.smd"

$lod 1
 {
  replacemodel "Rattletrap_Hook_attached_model.dmx" "lod1_Rattletrap_Hook_attached_model.dmx"
}
$model "hookshot" "UnknownModelName.smd"

$lod 1
 {
  replacemodel "UnknownModelName" "lod1_UnknownModelName"
}
$cdmaterials ""
$hboxset "default"
$hbox 0 "ankle_R" -15.124  -7.750  -3.560  5.082  4.782  10.788
$hbox 0 "knee_R" -18.130  -9.335  -11.284  10.052  10.596  7.318
$hbox 0 "thigh_R" -20.565  -3.997  -7.033  -7.790  8.445  4.473
$hbox 0 "ankle_L" -4.364  -5.584  -10.712  10.645  6.224  4.434
$hbox 0 "knee_L" 2.269  -6.547  -7.318  18.130  6.814  6.732
$hbox 0 "thigh_L" 7.536  -8.614  -4.625  20.238  3.966  7.018
$hbox 0 "Head_1" -8.764  -15.991  -10.394  17.507  15.991  22.289
$hbox 0 "back_thing" -20.888  -23.712  -11.804  7.154  26.318  25.492
$hbox 0 "wrist_L" -0.306  -5.880  -6.481  17.006  6.863  11.465
$hbox 0 "elbow_L" 1.603  -10.116  -11.377  20.713  9.193  8.090
$hbox 0 "bicep_L" 3.071  -5.061  -5.843  18.607  6.027  6.248
$hbox 0 "weapon_1" -14.449  -34.899  -12.076  14.000  61.191  19.568
$hbox 0 "wrist_R" -17.006  -6.863  -11.465  0.306  5.880  7.487
$hbox 0 "elbow_R" -27.073  -9.207  -8.090  -1.603  10.116  11.377
$hbox 0 "bicep_R" -18.607  -6.027  -4.785  -3.071  5.061  5.843
$hbox 0 "Spine_0" -9.684  -20.862  -21.805  1.668  19.103  13.175
$hbox 0 "Root_0" -7.460  -14.321  -9.903  4.560  0.004  5.794
$hboxset "select_high"
$hbox 0 "Spine_0" -72.103  -38.170  -36.326  -6.994  38.475  32.828
$hbox 0 "Spine_0" -7.142  -38.189  -30.471  46.979  37.008  26.898
$hboxset "select_low"
$hbox 0 "Spine_0" -71.484  -76.490  -71.597  58.977  67.517  56.256
$hboxset "feet"
$hbox 0 "ankle_R" -15.124  -7.750  -3.560  5.082  4.782  10.788
$hbox 0 "ankle_L" -4.364  -5.584  -10.712  10.645  6.224  4.434
$hboxset "head"
$hbox 0 "Head_1" -8.764  -9.321  -5.440  17.507  9.321  17.334
$hboxset "hands"
$hbox 0 "wrist_L" -0.543  -4.769  -7.591  16.768  7.975  10.355
$hbox 0 "wrist_R" -16.250  -7.616  -11.133  1.062  5.127  7.819
$attachment "attach_rocket" "missle_gun2_1" 10.00 17.00 -0.00 rotate 0.00 -0.00 0.00
$attachment "attach_glow" "back_thing" -12.00 -10.00 0.00 rotate 0.00 0.00 -0.00
$attachment "attach_batAss_1" "rocket_1_jnt" 0.00 0.00 -20.00 rotate 0.00 0.00 -0.00
$attachment "attach_batAss_2" "rocket_2_jnt" 0.00 0.00 -20.00 rotate 0.00 0.00 -0.00
$attachment "attach_batAss_3" "rocket_3_jnt" 0.00 0.00 -20.00 rotate 0.00 0.00 -0.00
$attachment "attach_batAss_4" "rocket_4_jnt" 0.00 0.00 -20.00 rotate 0.00 0.00 -0.00
$attachment "attach_attack1" "weapon_1" 0.00 25.00 0.00 rotate 0.00 -0.00 0.00
$attachment "attach_hitloc" "Spine_3" 0.00 -0.00 0.00 rotate -0.00 0.00 -0.00
$attachment "footInner_plc1_R" "ankle_R" -9.14 9.29 -2.84 rotate -11.24 10.39 -4.78
$attachment "footTip_plc1_R" "toeBase_R" -11.56 -1.33 1.89 rotate -0.00 19.19 0.00
$attachment "footOuter_plc1_R" "ankle_R" -10.98 1.72 -4.28 rotate -11.24 10.39 -4.78
$attachment "heel_plc1_R" "ankle_R" -8.69 4.56 -2.49 rotate -11.24 10.39 -4.78
$attachment "footOuter_plc0_L" "ankle_L" 10.98 -1.72 4.28 rotate -21.64 -17.88 11.31
$attachment "footInner_plc0_L" "ankle_L" 9.14 -9.29 2.84 rotate -21.64 -17.88 11.31
$attachment "heel_plc0_L" "ankle_L" 8.69 -4.56 2.49 rotate -21.64 -17.88 11.31
$attachment "footTip_plc0_L" "toeBase_L" 11.56 1.33 -1.89 rotate -0.00 0.00 0.00
$attachment "Head_plc0" "Head_1" 3.34 0.00 -6.72 rotate -0.00 -0.00 -0.00
$attachment "ArbitraryChain1_plc1" "front_flap1_0" 70.00 -0.00 0.00 rotate -0.00 -0.00 -0.00
$attachment "ArbitraryChain3_plc3" "missle_lever" 69.27 6.29 -7.86 rotate -0.00 0.00 -0.00
$attachment "ArbitraryChain2_plc2" "missle_gun2_1" 35.17 0.00 -0.00 rotate 0.00 -0.00 -0.00
$attachment "ArbitraryChain4_plc4" "back_thing" -61.98 -19.52 26.02 rotate 0.00 -0.00 -0.00
$attachment "ArbitraryChain_plc0" "rocket_1_jnt" -70.00 -0.00 0.00 rotate -0.00 0.00 -0.00
$attachment "Spine_plc0" "Spine_3" 6.42 0.00 -5.42 rotate -17.64 -0.00 -0.00
$attachment "Pinky_plc0_L" "thumb_2_L" 1.33 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "WeaponRoot_plc0" "weapon_1" 0.00 99.18 -0.00 rotate 0.00 0.00 -0.00
$attachment "Pinky_plc1_R" "thumb_2_R" -1.33 -0.00 0.00 rotate -67.72 -7.29 56.80
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 3.977 -17.380 62.798
$sequence BindPose "BindPose" fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 2 "Rattletrap.Footsteps" }
  { event AE_CL_PLAYSOUND 13 "Rattletrap.Footsteps" }
  { event AE_CL_PLAYSOUND 6 "Rattletrap.Foley" }
  { event AE_CL_PLAYSOUND 18 "Rattletrap.Foley" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 4 fps 30.00
$sequence spawn_temp "spawn_temp" ACT_DOTA_SPAWN 4 fps 30.00
$sequence idle_portrait "idle_portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence idle_alt "idle_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence attack "attack" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack_alt "attack_alt" ACT_DOTA_ATTACK 1 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 29 "Hero_Rattletrap.Death" }
}

$sequence death_alt "death_alt" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 28 "Hero_Rattletrap.Death" }
}

$sequence death_special "death_special" ACT_DOTA_DIE_SPECIAL 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence battery_assault "battery_assault" ACT_DOTA_RATTLETRAP_BATTERYASSAULT 1 fps 30.00
$sequence power_cogs "power_cogs" ACT_DOTA_RATTLETRAP_POWERCOGS 1 fps 30.00
$sequence rocketFlare "rocketFlare" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00
$sequence hookshot_start "hookshot_start" ACT_DOTA_RATTLETRAP_HOOKSHOT_START 1 fps 30.00
$sequence hookshot_loop "hookshot_loop" loop ACT_DOTA_RATTLETRAP_HOOKSHOT_LOOP 1 fps 30.00
$sequence hookshot_end "hookshot_end" ACT_DOTA_RATTLETRAP_HOOKSHOT_END 1 fps 30.00
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
