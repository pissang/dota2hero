$cd "H:\dota2resources\heros\spirit_breaker\smd"
$modelname "heroes/spirit_breaker/spirit_breaker.mdl"
$model "default" "spirit_breaker_model.dmx.smd"

$lod 1
 {
  replacemodel "spirit_breaker_model.dmx" "lod1_spirit_breaker_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "waist_armor10_0" -18.793  -22.093  -29.052  32.013  -0.186  -6.279
$hbox 0 "knee_R" -27.078  -12.405  -11.453  9.637  8.973  10.655
$hbox 0 "thigh_R" -48.202  -10.219  -15.765  -2.987  12.869  12.933
$hbox 0 "tail0_3" 7.137  -7.392  -8.775  25.620  7.066  3.175
$hbox 0 "tail0_2" 5.922  -4.584  -3.464  18.138  3.960  4.499
$hbox 0 "tail0_1" 5.830  -4.576  -3.183  22.780  3.240  4.953
$hbox 0 "tail0_0" -3.732  -5.595  -4.123  23.417  5.595  5.617
$hbox 0 "waist_armor7_0" -15.330  -24.506  -31.036  9.467  24.506  -2.781
$hbox 0 "knee_L" -9.639  -9.117  -10.661  27.059  12.271  11.456
$hbox 0 "thigh_L" 2.999  -12.936  -12.932  48.163  10.154  15.767
$hbox 0 "waist_armor8_0" 1.041  -30.135  -28.202  16.344  24.600  4.927
$hbox 0 "waist_armor9_0" -18.793  -6.345  -29.062  33.055  21.566  -5.172
$hbox 0 "mace_R4C0" -2.004  -25.292  -22.914  39.899  25.523  22.315
$hbox 0 "mace_R3C0" -1.514  -5.798  -1.517  15.516  5.957  1.127
$hbox 0 "mace_R2C0" -1.330  -5.797  -6.082  26.642  5.944  5.695
$hbox 0 "mace_R1C0" -1.546  -5.797  -6.104  26.382  5.944  5.642
$hbox 0 "mace_R0C0" -1.645  -5.797  -6.123  26.328  5.944  5.706
$hbox 0 "weapon4_0" -54.574  -13.295  -7.900  23.838  13.439  7.603
$hbox 0 "elbow_R" -48.598  -16.464  -17.359  6.489  23.209  18.750
$hbox 0 "bicep_R" -40.763  -19.294  -19.661  -14.828  11.781  21.103
$hbox 0 "Rshoulder6_0" -37.725  -24.202  -36.414  17.779  61.223  54.453
$hbox 0 "nose13_0" -1.275  -6.401  -10.376  4.481  6.301  1.530
$hbox 0 "beard11_0" -5.462  -3.101  -28.537  3.862  6.439  -4.574
$hbox 0 "beard112_0" -3.079  -4.021  -26.001  6.733  4.918  -6.013
$hbox 0 "mouth2_0" -12.324  -23.668  -31.002  22.024  24.209  3.911
$hbox 0 "hump1_0" -41.210  -12.018  -7.017  15.829  12.620  22.428
$hbox 0 "Lshoulder3_0" -19.986  -62.379  -55.677  35.518  23.045  35.190
$hbox 0 "elbow_L" -6.489  -23.209  -18.750  50.305  16.464  17.359
$hbox 0 "bicep_L" 15.975  -11.781  -20.710  40.763  19.294  19.661
$hbox 0 "Spine_3" -13.665  -24.578  -25.020  37.100  25.420  20.628
$hbox 0 "Spine_2" -24.406  -30.692  -45.544  13.461  30.692  26.456
$hbox 0 "Spine_0" -11.812  -26.766  -36.006  2.899  26.766  16.859
$hbox 0 "Root_0" -18.702  -32.315  -22.049  24.836  25.777  16.830
$hboxset "feet"
$hbox 0 "ankle_R" -36.554  -14.506  -14.433  6.113  12.166  13.218
$hbox 0 "ankle_L" -6.146  -12.519  -13.238  36.621  14.166  14.277
$hboxset "hands"
$hbox 0 "wrist_R" -34.650  -22.320  -17.270  1.254  8.807  15.194
$hbox 0 "wrist_L" 1.691  -8.879  -17.128  40.319  20.739  18.725
$hboxset "head"
$hbox 0 "Head_1" -51.016  -44.696  -64.275  30.564  47.646  69.191
$hboxset "select_low"
$hbox 0 "Root_0" -72.029  -103.731  -80.250  132.648  97.193  105.480
$hboxset "select_high"
$hbox 0 "Root_0" -18.252  -60.532  -80.214  83.676  55.252  107.687
$attachment "attach_attack1" "mace_R4C0" 10.00 0.00 -0.00 rotate -90.00 0.00 0.00
$attachment "attach_head" "Head_0" 17.00 0.00 40.00 rotate 0.00 0.00 0.00
$attachment "attach_hitloc" "Spine_2" 0.00 0.00 0.00 rotate 0.00 0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 9.888 -1.791 97.447
$sequence BindPose "BindPose" fps 30.00
$sequence idle "idle" loop ACT_DOTA_IDLE 6 fps 30.00
$sequence idle2 "idle2" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence attack "attack" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack2 "attack2" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack_backhand "attack_backhand" ACT_DOTA_ATTACK 1 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 11 "Hero_Spirit_Breaker.Footsteps" }
  { event AE_CL_PLAYSOUND 18 "Hero_Spirit_Breaker.Footsteps" }
  { event AE_CL_PLAYSOUND 3 "Hero_Spirit_Breaker.Forepaw" }
}

$sequence run_injured "run_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 11 "Hero_Spirit_Breaker.Footsteps" }
  { event AE_CL_PLAYSOUND 18 "Hero_Spirit_Breaker.Footsteps" }
  { event AE_CL_PLAYSOUND 3 "Hero_Spirit_Breaker.Forepaw" }
}

$sequence idle_injured "idle_injured" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 22.00
$sequence charge "charge" loop ACT_DOTA_RUN 1 fps 35.00 {
  { event AE_CL_PLAYSOUND 19 "Hero_Spirit_Breaker.Charge.Movement" }
  { event AE_CL_PLAYSOUND 12 "Hero_Spirit_Breaker.Charge.Footsteps" }
  { event AE_CL_PLAYSOUND 15 "Hero_Spirit_Breaker.Charge.Footsteps" }
  { event AE_CL_PLAYSOUND 8 "Hero_Spirit_Breaker.Forepaw" }
}

$sequence death "death" ACT_DOTA_DIE 1 fps 25.00 {
  { event AE_CL_PLAYSOUND 34 "BodyImpact_Common.Medium" }
}

$sequence portrait "portrait" loop ACT_DOTA_CAPTURE 4 fps 30.00
$sequence portrait_movie "portrait_movie" loop ACT_DOTA_CAPTURE 5 fps 30.00
$sequence portrait2 "portrait2" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence ultimate "ultimate" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence charge_attack "charge_attack" ACT_DOTA_ATTACK 1 fps 30.00
$sequence charge_pose "charge_pose" ACT_DOTA_SPIRIT_BREAKER_CHARGE_POSE 1 fps 30.00
$sequence charge_finish "charge_finish" ACT_DOTA_SPIRIT_BREAKER_CHARGE_END 1 fps 30.00
$sequence ultimate_run "ultimate_run" loop ACT_DOTA_SPIRIT_BREAKER_ULT_RUN 1 fps 30.00
$sequence teleport "teleport" loop ACT_DOTA_TELEPORT 1 fps 60.00
$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 30.00
$sequence victory "victory" loop ACT_DOTA_VICTORY 1 fps 30.00
$sequence defeat "defeat" loop ACT_DOTA_DEFEAT 1 fps 30.00
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
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 30.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 30.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 30.00
$sequence turns "turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
