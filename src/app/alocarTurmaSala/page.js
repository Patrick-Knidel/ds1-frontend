"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";
import { Pencil } from "lucide-react";

export default function AlocarTurmaSala() {
  const [tabela, setTabela] = useState([]);
  const [filterDia, setFilterDia] = useState(0);
  const [filterHora, setFilterHora] = useState(0);
  const [filterValue, setFilterValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpen2, setDialogOpen2] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [alocacoes, setAlocacoes] = useState([]);
  const [alocarTurmaSala, setAlocarTurmaSala] = useState({
    turmaId: 0,
    salaId: 0,
    diaSemana: 0,
    tempoSala: 0,
  });
  const [salasDisponiveis, setSalasDisponiveis] = useState([]);
  const [selectedSala, setSelectedSala] = useState(null);
  const [salas, setSalas] = useState([]);
  const [diaPDF, setDiaPDF] = useState(0);
  const [dialog3, setDialog3] = useState(false);
  //Editar preferencias Disciplina
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const [disciplinaEdit, setDisciplinaEdit] = useState(null);
  const [editedPreferences, setEditedPreferences] = useState({
    necessitaLaboratorio: false,
    necessitaArCondicionado: false,
    necessitaLoucaDigital: false,
  });
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);


  useEffect(() => {
    const getTurmasData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Turma");
        const turmas = response.data;
    
        // Buscar alocações para cada turma
        const turmasComAlocacoes = await Promise.all(
          turmas.map(async (turma) => {
            const alocacoesResponse = await axios.get(`http://localhost:5000/api/Turma/${turma.id}`);
            const alocacoes = alocacoesResponse.data.alocacoes || [];
            const alocacaoAtual = alocacoes[0]; // Considera a primeira alocação, se existir
    
            return {
              ...turma,
              alocada: !!alocacaoAtual,
              salaSelecionada: alocacaoAtual ? alocacaoAtual.salaId : null,
            };
          })
        );
    
        const mapResponse = turmasComAlocacoes.map((turma) => ({
          id: turma.id,
          professor: turma.professor,
          disciplina: turma.disciplina.nome,
          quantidadeAlunos: turma.quantidadeAlunos,
          codigoHorario: turma.codigoHorario,
          necessitaLaboratorio: turma.disciplina.necessitaLaboratorio,
          necessitaArCondicionado: turma.disciplina.necessitaArCondicionado,
          necessitaLoucaDigital: turma.disciplina.necessitaLoucaDigital,
          disciplinaId: turma.disciplina.id,
          alocada: turma.alocada,
          salaSelecionada: turma.salaSelecionada,
        }));
    
        setTabela(mapResponse);
      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
      }
    };       

    const getSalasData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Sala");
        setSalas(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getSalasData();
    getTurmasData();
  }, []);

  const handleAlocarTurmaSala = async () => {
    try {
      const turma = {
        turmaId: selectedTurma.id,
        salaId: selectedSala.id,
        diaSemana: parseInt(filterDia),
        tempoSala: parseInt(filterHora),
      }
      const response = await axios.post("http://localhost:5000/api/Turma/alocar-turma", turma);
      setDialogOpen(false);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  //Busca salas disponíveis para determinada disciplina
  const handleBuscarSalasDisponiveis = async (turma) => {
    try {
      // Mapear Código Horário para DiaSemana e TempoAula
      const horarioMapping = {
        1: { diaSemana: 1, tempoAula: 1 },
        2: { diaSemana: 1, tempoAula: 3 },
        3: { diaSemana: 2, tempoAula: 3 },
        4: { diaSemana: 3, tempoAula: 1 },
        5: { diaSemana: 4, tempoAula: 1 },
        6: { diaSemana: 4, tempoAula: 3 },
      };
  
      const horario = horarioMapping[turma.codigoHorario];
      if (!horario) {
        alert("Horário inválido para a turma.");
        return;
      }
  
      const response = await axios.get("http://localhost:5000/api/Turma/obter-salas-disponiveis", {
        params: {
          TurmaId: turma.id,
          DiaSemana: horario.diaSemana,
          TempoAula: horario.tempoAula,
        },
      });
  
      // Atualize as salas disponíveis no estado
      setSalasDisponiveis((prev) => ({
        ...prev,
        [turma.id]: response.data,
      }));
    } catch (error) {
      console.error("Erro ao buscar salas disponíveis:", error);
      alert("Erro ao buscar salas disponíveis.");
    }
  };

  //salva a alocação de sala disponivel da disciplina
  const handleSalvarAlocacao = async (turma) => {
    try {
      if (!selectedSala) {
        alert("Por favor, selecione uma sala.");
        return;
      }
  
      // Mapear Código Horário para DiaSemana e TempoAula
      const horarioMapping = {
        1: { diaSemana: 1, tempoAula: 1 },
        2: { diaSemana: 1, tempoAula: 3 },
        3: { diaSemana: 2, tempoAula: 3 },
        4: { diaSemana: 3, tempoAula: 1 },
        5: { diaSemana: 4, tempoAula: 1 },
        6: { diaSemana: 4, tempoAula: 3 },
      };
  
      const horario = horarioMapping[turma.codigoHorario];
      if (!horario) {
        alert("Horário inválido para a turma.");
        return;
      }
  
      const payload = {
        turmaId: turma.id,
        salaId: selectedSala.id,
        diaSemana: horario.diaSemana,
        tempoSala: horario.tempoAula,
      };
  
      await axios.post("http://localhost:5000/api/Turma/alocar-turma", payload);
      alert("Alocação salva com sucesso!");
      await getTurmasData(); // Atualizar tabela
    } catch (error) {
      console.error("Erro ao salvar alocação:", error);
      alert("Erro ao salvar alocação.");
    }
  };

  const handleAlocacoesTurma = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/Turma/${id}`);

      const alocacoes = response.data.alocacoes || [];

      const diasDaSemana = [
        "Domingo",        // 0
        "Segunda-feira",  // 1
        "Terça-feira",    // 2
        "Quarta-feira",   // 3
        "Quinta-feira",   // 4
        "Sexta-feira",    // 5
        "Sábado"          // 6
      ];

      // Mapeie as alocações substituindo `salaId` por `salaNome` e `tempo` por `diaSemana`
      const alocacoesComSalaENomeDia = alocacoes.map(alocacao => {
        const salaEncontrada = salas.find(sala => sala.id === alocacao.salaId);

        // Mapeie tempo para o nome do dia da semana
        const diaSemana = diasDaSemana[alocacao.tempo] || "Dia inválido";

        return {
          ...alocacao,
          salaId: salaEncontrada
            ? `${salaEncontrada.bloco}-${salaEncontrada.numero}`
            : "Sala não encontrada",
          diaSemana, // Substituindo tempo por dia da semana
        };
      });

      // Atualize o estado com as alocações ajustadas
      setAlocacoes(alocacoesComSalaENomeDia);
      console.log("Alocações com sala e dia da semana: ", alocacoesComSalaENomeDia);
    } catch (error) {
      console.log(error);
    }
  }

  const handleGerarRelatorioFinal = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/Sala/relatorio/${diaPDF}`, {
        responseType: 'blob'
      })
      // Criar um link temporário para fazer o download do arquivo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      // Definir o nome do arquivo a ser baixado
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'relatorio.pdf'; // Se não houver nome no cabeçalho, usa um nome padrão

      link.download = fileName;  // Define o nome do arquivo

      // Simula o clique no link para iniciar o download
      link.click();

    } catch (error) {
      console.log(error);
    }
  }

  //mapeamento que relaciona cada dia da semana aos códigos de horário
  const dayToCodeMapping = {
    1: [1, 1, 2], // Segunda
    2: [3, 1, 2], // Terça
    3: [4, 4, 3], // Quarta
    4: [5, 4, 6], // Quinta
    5: [6, 5], // Sexta
  };  

  //lógica de filtragem para considerar esse mapeamento
  const filteredTable = tabela.filter((row) => {
    // Lógica de filtragem de texto
    const matchesText = Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(filterValue.toLowerCase())
    );
  
    // Lógica de filtragem com base no dia
    const matchesDay = filterDia
      ? dayToCodeMapping[filterDia]?.includes(row.codigoHorario)
      : true;
  
    // Lógica de filtragem com base no dia e horário
    const matchesTime = filterDia && filterHora
      ? row.codigoHorario === dayToCodeMapping[filterDia]?.[filterHora - 1]
      : true;
  
    return matchesText && matchesDay && matchesTime;
  });
  
  //Função para abrir o diálogo de edição
  const handleEditPreferences = async (turma) => {
    try {
      const disciplinaId = turma.disciplinaId; // Certifique-se de que este é o campo correto
      if (!disciplinaId) {
        throw new Error("ID da disciplina não encontrado.");
      }
      const response = await axios.get(`http://localhost:5000/api/Disciplina/${disciplinaId}`);
      setSelectedDisciplina(response.data); // Define a disciplina selecionada no estado
      setDialogEditOpen(true); // Abre o modal para edição
    } catch (error) {
      console.error("Erro ao buscar detalhes da disciplina:", error);
      alert("Erro ao buscar detalhes da disciplina.");
    }
  };     
  
  //Função para salvar as edições
  const handleSavePreferences = async () => {
    try {
      if (!selectedDisciplina) {
        throw new Error("Nenhuma disciplina selecionada.");
      }
  
      const payload = {
        id: selectedDisciplina.id,
        necessitaLaboratorio: selectedDisciplina.necessitaLaboratorio,
        necessitaLoucaDigital: selectedDisciplina.necessitaLoucaDigital,
        necessitaArCondicionado: selectedDisciplina.necessitaArCondicionado,
      };
  
      console.log("Payload enviado para API:", payload); // Para depuração
  
      await axios.put(`http://localhost:5000/api/Disciplina/${selectedDisciplina.id}`, payload);
      alert("Alterações salvas com sucesso!");
      
      setDialogEditOpen(false); // Fecha o modal
      await getTurmasData(); // Atualiza a tabela com os dados atualizados
    } catch (error) {
      alert("Erro ao salvar as alterações.");
      console.error("Erro ao salvar as alterações:", error);
    }
  };    

  //atualiza a tela quando mudada preferencias da disciplina
  const getTurmasData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/Turma");
      const mapResponse = response.data.map((turma) => ({
        id: turma.id,
        professor: turma.professor,
        disciplina: turma.disciplina.nome,
        quantidadeAlunos: turma.quantidadeAlunos,
        codigoHorario: turma.codigoHorario,
        necessitaLaboratorio: turma.disciplina.necessitaLaboratorio,
        necessitaArCondicionado: turma.disciplina.necessitaArCondicionado,
        necessitaLoucaDigital: turma.disciplina.necessitaLoucaDigital,
        disciplinaId: turma.disciplina.id,
        alocacoes: "",
      }));
      setTabela(mapResponse);
    } catch (error) {
      console.log(error);
    }
  };
  // Chame getTurmasData no useEffect apenas uma vez
  useEffect(() => {
    getTurmasData();
    const getSalasData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Sala");
        setSalas(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getSalasData();
  }, []);

  //Listar e alocar sala na disciplina
  

  return (
    <main className="min-h-screen mb-20">
      <div className="w-full flex font-bold text-4xl justify-center mt-4 mb-8">
        Alocar Turma na Sala
      </div>

      <div className="p-6">
        <div className="flex items-center mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar"
              className="border border-black"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="dia" className="text-right">
              Dia da Semana:
            </Label>
            <select
              className="rounded-md border p-2 col-span-3"
              value={filterDia}
              onChange={(e) => setFilterDia(e.target.value)}
            >
              <option value="">Escolha uma opçao</option>
              <option value="1">Segunda-Feira</option>
              <option value="2">Terça-Feira</option>
              <option value="3">Quarta-Feira</option>
              <option value="4">Quinta-Feira</option>
              <option value="5">Sexta-Feira</option>
            </select>
          </div>

          <div className="flex items-center gap-2">

            <Label htmlFor="dia" className="text-right">
              Hora:
            </Label>
            <select
              className="rounded-md border p-2 col-span-3"
              value={filterHora}
              onChange={(e) => {
                const value = e.target.value;
                setFilterHora(value ? parseInt(value) : 0); // Define o horário ou reseta para 0
              }}              
            >
              <option>Selecione uma Opção</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <button className="rounded-md bg-blue-600 text-white p-2" onClick={() => setDialog3(true)}>
            Gerar Relatório Final
          </button>
          <div>

          </div>
        </div>

        <div className="border rounded-lg p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Disciplina</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Qtd Alunos</TableHead>
                <TableHead>Cód. Horário</TableHead>
                <TableHead>Laboratório</TableHead>
                <TableHead>Lousa</TableHead>
                <TableHead>Ar</TableHead>
                <TableHead>Sala Disponíveis</TableHead>
                <TableHead>Alocaçoes</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {filteredTable
                  .sort((a, b) => b.quantidadeAlunos - a.quantidadeAlunos) // Ordena aqui diretamente
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.disciplina}</TableCell>
                      <TableCell>{row.professor}</TableCell>
                      <TableCell>{row.quantidadeAlunos}</TableCell>
                      <TableCell>{row.codigoHorario}</TableCell>
                      <TableCell>{row.necessitaLaboratorio ? "Sim" : "Não"}</TableCell>
                      <TableCell>{row.necessitaLoucaDigital ? "Sim" : "Não"}</TableCell>
                      <TableCell>{row.necessitaArCondicionado ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        {row.alocada ? (
                          <span className="text-green-500 font-bold">Alocado</span>
                        ) : (
                          <select
                            className="rounded-md border p-2"
                            value={selectedSala?.id || ""}
                            onClick={() => handleBuscarSalasDisponiveis(row)} // Busca salas ao clicar
                            onChange={(e) => {
                              const selected = salasDisponiveis[row.id]?.find(
                                (sala) => sala.id === parseInt(e.target.value)
                              );
                              setSelectedSala(selected);
                            }}
                          >
                            <option value="">Selecione uma sala</option>
                            {salasDisponiveis[row.id]?.map((sala) => (
                              <option key={sala.id} value={sala.id}>
                                Sala: Bloco {sala.bloco} - Número {sala.numero}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          className="mr-2 text-blue-500 hover:text-blue-700"
                          onClick={() => handleEditPreferences(row)}
                        >
                          <Pencil />
                        </button>
                        <button
                          className="mr-2 text-green-500 hover:text-green-700"
                          onClick={() => {
                            handleAlocacoesTurma(row.id);
                            setDialogOpen2(true);
                          }}
                        >
                          <Eye />
                        </button>
                      </TableCell>
                      <TableCell>
                        {row.alocada ? (
                          <button
                            className="rounded-md bg-gray-400 text-white p-2 cursor-not-allowed"
                            disabled
                          >
                            Alocado
                          </button>
                        ) : (
                          <button
                            className="rounded-md bg-blue-600 text-white p-2"
                            onClick={() => handleSalvarAlocacao(row)} // Salvar alocação
                          >
                            Salvar
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>

          </Table>
        </div>

        <div className="">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent asChild>
              <DialogHeader>
                <DialogTitle>Alocar Turma</DialogTitle>
                <DialogDescription>
                  {selectedTurma && (
                    <>
                      <p>Tem certeza que deseja alocar a turma {selectedTurma.disciplina} do professor {selectedTurma.professor} na sala {selectedSala.numero} bloco {selectedSala.bloco}?</p>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="button" onClick={() => {
                  handleAlocarTurmaSala();
                  setDialogOpen(false);
                }}
                >
                  Sim
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen2} onOpenChange={setDialogOpen2}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alocaçoes</DialogTitle>
                <DialogDescription>
                  {alocacoes && alocacoes.length > 0 ? (
                    alocacoes.map((alocacao, index) => (
                      <p key={index}>
                        Dia da Semana: {alocacao.diaSemana}, Tempo: {alocacao.tempo},
                        Sala: {alocacao.salaId}, Turma ID: {alocacao.turmaId}
                      </p>
                    ))
                  ) : (
                    <p>Nenhuma alocação encontrada.</p>
                  )}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen2(false)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialog3} onOpenChange={setDialog3}>
            <DialogContent className="max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Baixar PDF</DialogTitle>
              </DialogHeader>

              <DialogDescription>
                <div className="overflow-x-auto">
                  <Label htmlFor="dia" className="text-right">
                    Dia da Semana:
                  </Label>
                  <select
                    className="rounded-md border p-2 col-span-3"
                    value={diaPDF}
                    onChange={(e) => setDiaPDF(e.target.value)}
                  >
                    <option value="">Escolha uma opçao</option>
                    <option value="1">Segunda-Feira</option>
                    <option value="2">Terça-Feira</option>
                    <option value="3">Quarta-Feira</option>
                    <option value="4">Quinta-Feira</option>
                    <option value="5">Sexta-Feira</option>
                  </select>
                </div>
              </DialogDescription>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog3(false)}>
                  Fechar
                </Button>
                <Button variant="outline" onClick={() => handleGerarRelatorioFinal()}>
                  Baixar PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogEditOpen} onOpenChange={setDialogEditOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Editar Preferências da Disciplina</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lab" className="text-right">Laboratório:</Label>
                  <Input
                    id="lab"
                    type="checkbox"
                    checked={selectedDisciplina?.necessitaLaboratorio || false}
                    onChange={(e) =>
                      setSelectedDisciplina({
                        ...selectedDisciplina,
                        necessitaLaboratorio: e.target.checked,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lousa" className="text-right">Lousa Digital:</Label>
                  <Input
                    id="lousa"
                    type="checkbox"
                    checked={selectedDisciplina?.necessitaLoucaDigital || false}
                    onChange={(e) =>
                      setSelectedDisciplina({
                        ...selectedDisciplina,
                        necessitaLoucaDigital: e.target.checked,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ar" className="text-right">Ar Condicionado:</Label>
                  <Input
                    id="ar"
                    type="checkbox"
                    checked={selectedDisciplina?.necessitaArCondicionado || false}
                    onChange={(e) =>
                      setSelectedDisciplina({
                        ...selectedDisciplina,
                        necessitaArCondicionado: e.target.checked,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogEditOpen(false)}>Cancelar</Button>
                <Button onClick={handleSavePreferences}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </main>
  );
}
