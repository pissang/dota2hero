$cd "H:\dota2resources\heros\slark\smd"
$modelname "heroes/slark/slark.mdl"
$model "default" "slark_6k_model.dmx.smd"

$lod 1
 {
  replacemodel "slark_6k_model.dmx" "lod1_slark_6k_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "knee_R" -20.855  -6.015  -7.426  -0.884  6.551  7.038
$hbox 0 "thigh_R" -40.255  -8.859  -10.319  -7.054  7.738  8.732
$hbox 0 "bracer0_0" 1.659  -8.727  -5.772  22.251  13.607  13.795
$hbox 0 "elbow_R" -37.403  -9.367  -11.378  5.257  12.260  11.887
$hbox 0 "bicep_R" -19.856  -6.738  -8.138  -5.992  6.464  6.427
$hbox 0 "backJig5_0" -5.537  0.000  8.151  -0.477  2.484  15.781
$hbox 0 "elbow_L" 2.625  -8.490  -6.237  16.974  9.367  9.119
$hbox 0 "bicep_L" 5.992  -6.464  -6.427  19.856  6.738  8.138
$hbox 0 "shoulderPad" -8.372  -27.333  -22.829  20.512  23.682  21.705
$hbox 0 "LEar_R3C0" -2.869  -1.745  -0.639  2.554  0.831  1.741
$hbox 0 "LEar_R2C0" -5.889  -9.466  -0.853  13.648  0.379  1.564
$hbox 0 "LEar_R1C0" -2.685  -10.465  -1.246  19.405  11.106  4.987
$hbox 0 "hoodDrag4_0" -12.429  -14.532  -27.597  -3.441  14.532  -8.134
$hbox 0 "REar_R3C0" -2.890  -1.481  0.032  2.961  0.538  0.732
$hbox 0 "REar_R2C0" -6.310  -9.467  -3.260  13.648  1.427  0.853
$hbox 0 "REar_R1C0" -2.685  -10.465  -3.551  19.405  11.106  1.246
$hbox 0 "chest" -19.770  -22.247  -24.920  17.608  23.045  17.423
$hbox 0 "waist" -5.199  -17.368  -19.167  7.275  18.566  16.126
$hbox 0 "knee_L" 0.884  -6.551  -6.133  20.855  6.015  7.426
$hbox 0 "thigh_L" 7.054  -7.060  -8.732  40.255  8.859  10.319
$hbox 0 "root" -18.324  -17.040  -30.861  14.200  17.040  -0.390
$hboxset "feet"
$hbox 0 "ankle_R" -20.084  -10.280  -24.773  -4.392  9.315  5.950
$hbox 0 "ankle_L" -3.268  -9.315  -5.950  20.084  10.280  24.773
$hboxset "hands"
$hbox 0 "wrist_R" -22.538  -14.910  -6.556  -6.943  1.477  10.740
$hbox 0 "wrist_L" 6.943  -1.477  -10.740  22.538  14.910  6.801
$hboxset "head"
$hbox 0 "head" -11.896  -29.000  -28.964  27.309  29.000  28.094
$hboxset "select_low"
$hbox 0 "root" -55.202  -75.934  -54.491  82.539  75.934  61.968
$hboxset "select_high"
$hbox 0 "root" -25.054  -33.523  -53.960  48.309  33.523  42.309
$attachment "attach_attack1" "wrist_R" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "attach_jaw" "jaw6_0" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "attach_eyeL" "head" 20.00 7.00 -4.00 rotate 0.00 -0.00 -0.00
$attachment "attach_eyeR" "head" 20.00 -7.00 -4.00 rotate 0.00 -0.00 -0.00
$attachment "attach_hitloc" "chest" 0.00 0.00 0.00 rotate 0.00 0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -9.797 -1.752 62.142
$sequence BindPose "BindPose" fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 5 "Hero_Slark.Footsteps" }
  { event AE_CL_PLAYSOUND 17 "Hero_Slark.Footsteps" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 5 fps 30.00
$sequence idle2 "idle2" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle3 "idle3" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00
$sequence death2 "death2" ACT_DOTA_DIE 1 fps 30.00
$sequence attack "attack" ACT_DOTA_ATTACK 3 fps 30.00
$sequence attack2 "attack2" ACT_DOTA_ATTACK 1 fps 30.00
$sequence pounce "pounce" ACT_DOTA_SLARK_POUNCE 1 fps 40.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence shadow_dance "shadow_dance" loop ACT_DOTA_RUN 1 fps 30.00
$sequence dark_pact "dark_pact" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 36.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 36.00
$sequence teleport "teleport" loop ACT_DOTA_TELEPORT 1 fps 30.00
$sequence portrait "portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence idle_injured "idle_injured" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence attack_injured "attack_injured" ACT_DOTA_ATTACK 1 fps 30.00
$sequence run_injured "run_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 5 "Hero_Slark.Footsteps" }
  { event AE_CL_PLAYSOUND 17 "Hero_Slark.Footsteps" }
}

$sequence pounce_ripper "pounce_ripper" ACT_DOTA_SLARK_POUNCE 1 fps 30.00
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 24.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 24.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 24.00
$sequence turns "turns_lookFrame_0" fps 24.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
