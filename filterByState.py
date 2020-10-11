import numpy as np
import pandas as pd
coltypes = {'ID de caso':int, 'Fecha de notificación':str, 'Código DIVIPOLA':int,
       'Ciudad de ubicación':str, 'Departamento o Distrito ':str, 'atención':str, 'Edad':int,
       'Sexo':str, 'Tipo':str, 'Estado':str, 'País de procedencia':str, 'FIS':str,
       'Fecha de muerte':str, 'Fecha diagnostico':str, 'Fecha recuperado':str,
       'fecha reporte web':str, 'Tipo recuperación':str, 'Codigo departamento':int,
       'Codigo pais':float, 'Pertenencia etnica':str, 'Nombre grupo etnico':str,
       'ubicación recuperado':str}
df = pd.read_csv("Casos_positivos_de_COVID-19_en_Colombia.csv",dtype=coltypes)
include =['str', 'float', 'int']

print(df.columns)
print(df["Departamento o Distrito "].describe())
depts = df["Departamento o Distrito "].unique()
print(depts)
print(type(depts))
for dept in depts:
       deptdf = df[df["Departamento o Distrito "] == dept]
       deptdf.to_csv(dept.replace(" ","_")+".csv",index=False,header=True)
boyaca = df[df["Departamento o Distrito "] == "Boyacá"]
print(boyaca.head(10).to_string())
boyaca.to_csv("boyaca.csv")