import sys, json, statistics
import simulacion_lockers as S
ESC = sys.argv[1]
OPTMG = {"NORMAL":(15,10), "NAVIDAD":(15,15), "CYBER":(25,15)}
CLTC = [10,25,40,50,55,70,90,110,130]
SEED0, NREP = 1000, 30
m,g = OPTMG[ESC]
out = {c: statistics.mean([S.simular(ESC, dict(CLTC=c,CLTM=m,CLTG=g), SEED0+k)['CPE']
                            for k in range(NREP)]) for c in CLTC}
json.dump(out, open(f"curvaU_{ESC}.json","w"))
print(ESC, {c:round(v,3) for c,v in out.items()})
