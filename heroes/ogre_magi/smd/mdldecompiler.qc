$cd "H:\dota2resources\heros\ogre_magi\smd"
$modelname "heroes/ogre_magi/ogre_magi.mdl"
$model "default" "ogre_magi_model.dmx.smd"

$lod 1
 {
  replacemodel "ogre_magi_model.dmx" "lod1_ogre_magi_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "weapon3_0" -31.990  -109.619  -29.654  21.325  57.918  21.537
$hbox 0 "elbow_L" -54.362  -23.203  -36.586  49.260  18.026  29.174
$hbox 0 "topKnot2_0" -3.524  -10.222  -1.487  13.380  9.061  14.879
$hbox 0 "elbow_R" -68.447  -12.644  -17.285  15.607  20.578  15.726
$hbox 0 "bicep_R" -41.488  -16.000  -24.521  7.424  16.670  19.818
$hbox 0 "spine2" -17.153  -44.207  -46.229  44.953  39.189  34.390
$hbox 0 "spine1" -25.985  -45.217  -38.777  40.532  45.217  34.885
$hbox 0 "frontBag0_0" -11.665  -21.607  -26.765  14.219  26.987  10.724
$hbox 0 "knee_R" -34.138  -20.568  -19.233  2.789  20.671  38.907
$hbox 0 "thigh_R" -42.575  -22.019  -35.593  11.959  23.886  36.566
$hbox 0 "knee_L" -2.789  -18.416  -37.300  34.138  16.237  20.493
$hbox 0 "thigh_L" -9.795  -25.299  -35.138  42.575  23.958  37.913
$hbox 0 "root" -42.217  -45.484  -42.807  51.913  43.799  30.185
$hboxset "head"
$hbox 0 "head1" -16.102  -21.682  -29.399  27.977  19.032  12.615
$hbox 0 "head" -15.924  -22.057  -22.544  32.115  23.137  28.673
$hboxset "hands"
$hbox 0 "wrist_L" -9.013  -9.919  -13.755  26.832  17.795  12.568
$hbox 0 "wrist_R" -26.832  -17.795  -10.056  -0.068  4.448  13.739
$hboxset "feet"
$hbox 0 "ankle_R" -35.409  -16.853  -8.045  8.971  14.753  16.297
$hbox 0 "ankle_L" -8.965  -14.753  -16.297  35.409  16.853  8.045
$hboxset "select_high"
$hbox 0 "root" -28.310  -41.910  2.512  36.522  41.910  60.620
$hbox 0 "root" -24.482  -41.642  -94.409  34.179  39.957  1.295
$hboxset "select_low"
$hbox 0 "root" -77.863  -90.627  -96.449  87.560  88.942  59.029
$attachment "attach_attack1" "weapon3_0" 10.00 -89.00 -6.00 rotate 0.00 0.00 -0.00
$attachment "attach_attack3" "weapon3_0" 10.00 -89.00 -6.00 rotate 0.00 0.00 -0.00
$attachment "attach_toss" "igniteParticle6_0" -0.00 0.00 0.00 rotate 0.00 0.00 -0.00
$attachment "attach_hitloc" "spine2" 0.00 0.00 0.00 rotate -0.00 0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 4.848 -1.920 88.433
$sequence BindPose "BindPose" fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_OgreMagi.Footsteps" }
  { event AE_CL_PLAYSOUND 12 "Hero_OgreMagi.Footsteps" }
  { event AE_CL_PLAYSOUND 2 "Hero_OgreMagi.Movement" }
  { event AE_CL_PLAYSOUND 13 "Hero_OgreMagi.Movement" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 10 fps 30.00
$sequence idle_headButt "idle_headButt" ACT_DOTA_IDLE_RARE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 93 "Hero_OgreMagi.Idle.Headbutt" }
  { event AE_CL_PLAYSOUND 128 "Hero_OgreMagi.Idle.Punch" }
}

$sequence idle_bellyScratch "idle_bellyScratch" ACT_DOTA_IDLE_RARE 2 fps 30.00 {
  { event AE_CL_PLAYSOUND 23 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 37 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 50 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 68 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 78 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 98 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 110 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 128 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 141 "Hero_OgreMagi.Idle.Scratch" }
  { event AE_CL_PLAYSOUND 156 "Hero_OgreMagi.Idle.Scratch" }
}

$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence attack1 "attack1" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack3 "attack3" ACT_DOTA_ATTACK 1 fps 30.00
$sequence dieBack "dieBack" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 31 "BodyImpact_Common.Giant" }
}

$sequence fireblast "fireblast" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence fireblast_withUltiSceptre "fireblast_withUltiSceptre" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence ignite "ignite" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence bloodlust "bloodlust" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_OgreMagi.Bloodlust.Cast.Anim" }
}

$sequence ingameCapture "ingameCapture" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence capture "capture" loop ACT_DOTA_CAPTURE 2 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence blogPose "blogPose" fps 30.00
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
