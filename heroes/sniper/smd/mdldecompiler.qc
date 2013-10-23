$cd "H:\dota2resources\heros\sniper\smd"
$modelname "heroes/sniper/sniper.mdl"
$model "default" "sniper_model.dmx.smd"

$lod 1
 {
  replacemodel "sniper_model.dmx" "lod1_sniper_model.dmx"
}
$cdmaterials ""
$hboxset "default"
$hbox 0 "head" -8.075  -15.705  -26.512  20.999  16.888  13.005
$hbox 0 "wrist_L" -0.017  -4.650  -10.694  19.684  10.442  5.366
$hbox 0 "elbow_L" 0.625  -8.922  -10.927  27.487  8.150  8.741
$hbox 0 "bicep_L" 2.409  -8.068  -11.967  23.064  9.415  8.530
$hbox 0 "wrist_R" -19.368  -10.180  -5.543  -1.764  4.626  10.740
$hbox 0 "elbow_R" -27.570  -8.160  -8.638  -0.625  8.806  10.824
$hbox 0 "bicep_R" -23.870  -10.817  -9.262  -1.034  8.928  13.034
$hbox 0 "Spine_1" 2.863  -11.166  1.164  11.990  11.232  7.219
$hbox 0 "Spine_0" -3.521  -13.502  5.096  18.287  19.831  11.100
$hbox 0 "root" -14.059  -22.906  -16.673  21.720  23.395  17.625
$hboxset "select_high"
$hbox 0 "root" -22.628  -26.296  5.289  31.221  26.549  54.602
$hbox 0 "root" -27.073  -29.978  -52.792  33.505  30.115  5.793
$hboxset "select_low"
$hbox 0 "root" -72.422  -77.614  -52.052  85.320  77.756  57.837
$hboxset "head"
$hbox 0 "head" -9.528  -16.466  -27.631  22.268  16.322  13.507
$hboxset "hands"
$hbox 0 "wrist_L" -0.754  -5.691  -6.943  19.929  11.372  7.041
$hbox 0 "wrist_R" -18.712  -10.382  -6.894  -1.690  5.121  10.991
$attachment "ArbitraryChain2_plc2" "beard2_0" 140.18 -0.00 -0.00 rotate -0.00 -0.00 -0.00
$attachment "attach_attack1" "Gun_cock_0" 71.00 1.00 -1.00 rotate -0.00 0.00 0.00
$attachment "Thumb_plc1_R" "Cloth_test_R4C0" 11.79 0.00 0.00 rotate -0.00 0.00 -0.00
$attachment "Index_plc1_R" "Cloth_test_R4C1" 13.90 0.00 -0.00 rotate 0.00 -0.00 0.00
$attachment "Mid_plc1_R" "Cloth_test_R4C2" 12.63 0.00 0.00 rotate 0.00 0.00 -0.00
$attachment "attach_hitloc" "Spine_1" 0.00 0.00 0.00 rotate 70.00 0.00 0.00
$attachment "ArbitraryChain1_plc1" "bag1_1" 69.39 -0.00 0.00 rotate 0.00 -0.00 -0.00
$attachment "attach_attack_tmp" "attach_attack_tmp" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 1.342 0.071 54.067
$sequence BindPose "BindPose" fps 30.00
$sequence sniper_run "sniper_run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 11 "Hero_Sniper.Footsteps" }
}

$sequence sniper_idle "sniper_idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence sniper_loadout "sniper_loadout" loop ACT_DOTA_LOADOUT 15 fps 30.00
$sequence sniper_portrait "sniper_portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence sniper_portrait_instagib "sniper_portrait_instagib" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence sniper_portrait_great_safari "sniper_portrait_great_safari" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence sniper_attack "sniper_attack" ACT_DOTA_ATTACK 1 fps 30.00
$sequence sniper_death "sniper_death" ACT_DOTA_DIE 2 fps 30.00 {
  { event AE_CL_PLAYSOUND 36 "BodyImpact_Common.Light" }
  { event AE_CL_PLAYSOUND 67 "BodyImpact_Common.Light" }
}

$sequence sniper_attack_schrapnel_cast1_aggressive "sniper_attack_schrapnel_cast1_aggressive" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence sniper_assassinate_cast4_aggressive "sniper_assassinate_cast4_aggressive" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence sniper_idle_aggressive "sniper_idle_aggressive" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence sniper_run_aggressive "sniper_run_aggressive" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 11 "Hero_Sniper.Footsteps" }
}

$sequence sniper_flail "sniper_flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence sniper_stun "sniper_stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence teleport "teleport" loop ACT_DOTA_TELEPORT 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 12 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 28 "Hero_Sniper.Footsteps" }
}

$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 4 "BodyImpact_Common.Light" }
  { event AE_CL_PLAYSOUND 22 "BodyImpact_Common.Light" }
}

$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 4 "BodyImpact_Common.Light" }
  { event AE_CL_PLAYSOUND 22 "BodyImpact_Common.Light" }
}

$sequence assassinate_instagib_aggressive "assassinate_instagib_aggressive" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
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
$sequence sniper_victory "sniper_victory" loop ACT_DOTA_VICTORY 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 13 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 30 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 42 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 60 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 72 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 90 "Hero_Sniper.Footsteps" }
}

$sequence sniper_victory_alt "sniper_victory_alt" loop ACT_DOTA_VICTORY 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 13 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 28 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 45 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 58 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 77 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 96 "Hero_Sniper.Tutorial_Intro_a" }
  { event AE_CL_PLAYSOUND 107 "Hero_Sniper.Tutorial_Intro_b" }
  { event AE_CL_PLAYSOUND 116 "Hero_Sniper.Tutorial_Intro_c" }
  { event AE_CL_PLAYSOUND 143 "Hero_Sniper.Tutorial_Intro_a" }
  { event AE_CL_PLAYSOUND 162 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 176 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 192 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 204 "Hero_Sniper.Footsteps" }
}

$sequence sniper_intro_short "sniper_intro_short" ACT_DOTA_INTRO 1 fps 30.00 {
  { event AE_CL_SPEECH 10 "TLK_DOTA_TAUNT|taunt_type=sniper_here_salute" }
  { event AE_CL_PLAYSOUND 71 "Hero_Sniper.Tutorial_Intro_a" }
  { event AE_CL_PLAYSOUND 82 "Hero_Sniper.Tutorial_Intro_b" }
  { event AE_CL_PLAYSOUND 102 "Hero_Sniper.Tutorial_Intro_c" }
  { event AE_CL_PLAYSOUND 20 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 22 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 71 "Hero_Sniper.Footsteps" }
}

$sequence sniper_death_fall_back_alt "sniper_death_fall_back_alt" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 9 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 18 "Hero_Sniper.Footsteps" }
  { event AE_CL_PLAYSOUND 48 "BodyImpact_Common.Light" }
  { event AE_CL_PLAYSOUND 56 "Hero_Sniper.Tutorial_Intro_a" }
}

$sequence sniper_idle_wolfhound "sniper_idle_wolfhound" loop ACT_DOTA_IDLE 3 fps 30.00
$sequence sniper_wolfhound_idle_alt "sniper_wolfhound_idle_alt" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence sniper_loadout_wolfhound_alt "sniper_loadout_wolfhound_alt" loop ACT_DOTA_LOADOUT 1 fps 30.00
$sequence sniper_portrait_wolfhound "sniper_portrait_wolfhound" loop ACT_DOTA_CAPTURE 2 fps 30.00
$sequence sniper_portrait_wolfhound_alt "sniper_portrait_wolfhound_alt" loop ACT_DOTA_CAPTURE 1 fps 30.00
